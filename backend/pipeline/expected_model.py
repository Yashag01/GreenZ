import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import logging

logger = logging.getLogger(__name__)

MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

# Full CSV paths — used when training from scratch to avoid 96-row window problem
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")


def _get_solar_features(df):
    return [c for c in ["irradiance_wm2", "ambient_temp_c", "module_temp_c"] if c in df.columns]


def _get_wind_features(df):
    candidates = ["wind_speed_ms", "ambient_temp_c", "vibration_mm_s"]
    return [c for c in candidates if c in df.columns]


def train_or_load_model(asset_id, df_asset):
    """
    Load existing model if available.
    If not, train on the FULL historical CSV (not the 96-row inference window).
    """
    model_path = os.path.join(MODELS_DIR, f"{asset_id}_rf.pkl")

    is_solar = "irradiance_wm2" in df_asset.columns
    features = _get_solar_features(df_asset) if is_solar else _get_wind_features(df_asset)

    if not features:
        return None, "fallback_rule_based"

    # Load cached model
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            if hasattr(model, "n_features_in_") and model.n_features_in_ == len(features):
                return model, "trained"
        except Exception:
            pass

    # Train on FULL historical data to avoid nighttime-only window problem
    full_df = _load_full_asset_data(asset_id, is_solar)
    if full_df is not None and len(full_df) >= 100:
        df_train = full_df
    else:
        df_train = df_asset  # fallback to inference window

    available_features = [f for f in features if f in df_train.columns]
    df_train = df_train.dropna(subset=available_features + ["actual_power"])

    # For solar: only train on rows with meaningful irradiance to avoid nighttime noise
    if is_solar and "irradiance_wm2" in df_train.columns:
        df_train = df_train[df_train["irradiance_wm2"] > 0.05]

    if len(df_train) < 50:
        return None, "fallback_rule_based"

    X = df_train[available_features]
    y = df_train["actual_power"]

    logger.info(f"Training RF model for {asset_id} on {len(df_train)} rows...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10, n_jobs=-1)
    model.fit(X, y)

    joblib.dump(model, model_path)
    return model, "trained"


def _load_full_asset_data(asset_id, is_solar):
    """Load full historical data for this asset from CSV."""
    csv_name = "solar_clean.csv" if is_solar else "wind_clean.csv"
    csv_path = os.path.join(PROCESSED_DIR, csv_name)
    if not os.path.exists(csv_path):
        return None
    try:
        df = pd.read_csv(csv_path)
        return df[df["asset_id"] == asset_id].copy()
    except Exception:
        return None


def compute_expected_power(asset_id, df_asset, capacity_kw=None):
    """
    Compute expected power for each row using the trained RF model.
    Falls back to physics-based rule if model unavailable.
    """
    model, status = train_or_load_model(asset_id, df_asset)

    is_solar = "irradiance_wm2" in df_asset.columns
    features = _get_solar_features(df_asset) if is_solar else _get_wind_features(df_asset)

    expected_power = []

    for idx, row in df_asset.iterrows():
        try:
            available = [f for f in features if f in row.index and pd.notna(row[f])]
            if model and len(available) == model.n_features_in_:
                X_row = row[available].to_frame().T.astype(float)
                pred = float(model.predict(X_row)[0])
                # For solar at night (very low irradiance), expected = 0
                if is_solar and row.get("irradiance_wm2", 1) < 0.05:
                    pred = 0.0
                expected_power.append(max(0.0, pred))
            else:
                expected_power.append(_rule_based_expected(row, is_solar, capacity_kw, df_asset))
        except Exception:
            expected_power.append(np.nan)

    return expected_power, status


def _rule_based_expected(row, is_solar, capacity_kw, df_asset):
    """Physics-based fallback."""
    if is_solar:
        irr = float(row.get("irradiance_wm2", 0) or 0)
        if irr < 0.05:
            return 0.0
        cap = capacity_kw or (df_asset["actual_power"].max() * 1.1)
        # irradiance is normalized 0-1.2 range; scale linearly
        return max(0.0, cap * min(irr / 1.0, 1.0))
    else:
        speed = float(row.get("wind_speed_ms", 0) or 0)
        cap = capacity_kw or 2000.0
        if speed < 3.0 or speed > 25.0:
            return 0.0
        elif speed >= 12.0:
            return cap
        else:
            return cap * ((speed - 3.0) / (12.0 - 3.0)) ** 3
