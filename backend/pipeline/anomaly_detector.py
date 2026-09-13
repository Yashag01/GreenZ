import os
import joblib
import pandas as pd
import numpy as np
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)

MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

def train_or_load_autoencoder(asset_id, df, features):
    """
    Trains a lightweight Autoencoder (MLPRegressor) on the normal historical data.
    """
    model_path = os.path.join(MODELS_DIR, f"{asset_id}_autoencoder.pkl")
    scaler_path = os.path.join(MODELS_DIR, f"{asset_id}_scaler.pkl")
    
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        try:
            ae = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            if hasattr(ae, "n_features_in_") and ae.n_features_in_ == len(features):
                return ae, scaler
        except Exception:
            pass

    try:
        from cache.analytics_store import store
        if asset_id in store.full_raw_data:
            df_full = store.full_raw_data[asset_id]
            df_for_training = df_full.dropna(subset=features)
        else:
            df_for_training = df.dropna(subset=features)
    except Exception:
        df_for_training = df.dropna(subset=features)

    if df_for_training.empty or len(df_for_training) < 10:
        return None, None
        
    if "expected_power" in df_for_training.columns and "deviation_pct" in df_for_training.columns:
        mask_normal = (df_for_training["expected_power"] > 5) & (df_for_training["deviation_pct"].abs() < 15)
        df_train = df_for_training[mask_normal]
    else:
        df_train = df_for_training
    
    if len(df_train) < 10:
        df_train = df_for_training

    X = df_train[features].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    hidden_size = max(2, len(features) // 2)
    ae = MLPRegressor(hidden_layer_sizes=(hidden_size,), activation='relu', solver='adam', max_iter=200, random_state=42)
    ae.fit(X_scaled, X_scaled)

    joblib.dump(ae, model_path)
    joblib.dump(scaler, scaler_path)
    return ae, scaler

def detect_anomalies_vectorized(asset_id, df):
    """
    Runs ARCANA-inspired Autoencoder anomaly detection over the dataframe.
    Calculates reconstruction error and identifies the root cause feature.
    """
    df = df.copy()
    
    df["ae_anomaly_score"] = 0.0
    df["root_cause_feature"] = "Unknown"
    df["ae_status"] = "Normal"
    
    is_solar = "irradiance_wm2" in df.columns
    if is_solar:
        features = ["actual_power", "expected_power", "irradiance_wm2", "module_temp_c"]
    else:
        features = ["actual_power", "expected_power", "wind_speed_ms", "vibration_mm_s"]
        
    features = [f for f in features if f in df.columns]
    
    if len(features) < 2:
        return df

    ae, scaler = train_or_load_autoencoder(asset_id, df, features)
    if ae is None or scaler is None:
        return df

    valid_mask = df[features].notna().all(axis=1)
    if valid_mask.any():
        X = df.loc[valid_mask, features].values
        X_scaled = scaler.transform(X)
        X_pred_scaled = ae.predict(X_scaled)
        
        mse = np.mean(np.square(X_scaled - X_pred_scaled), axis=1)
        df.loc[valid_mask, "ae_anomaly_score"] = mse
        
        abs_errors = np.abs(X_scaled - X_pred_scaled)
        max_error_indices = np.argmax(abs_errors, axis=1)
        root_causes = [features[i] for i in max_error_indices]
        df.loc[valid_mask, "root_cause_feature"] = root_causes
        
        threshold_critical = np.percentile(mse, 95) if len(mse) > 20 else 2.0
        threshold_warning = np.percentile(mse, 85) if len(mse) > 20 else 1.0
        
        threshold_critical = max(threshold_critical, 1.5)
        threshold_warning = max(threshold_warning, 0.8)
        
        conditions = [
            (df["ae_anomaly_score"] >= threshold_critical),
            (df["ae_anomaly_score"] >= threshold_warning)
        ]
        choices = ["Critical", "Warning"]
        df["ae_status"] = np.select(conditions, choices, default="Normal")

    return df

def detect_anomalies(row):
    """
    Returns state: "Normal", "Warning", or "Critical",
    plus a reason string, utilizing Autoencoder results if available.
    """
    reasons = []
    
    status = row.get("ae_status", "Normal")
    root_cause = row.get("root_cause_feature", "Unknown")
    ae_score = row.get("ae_anomaly_score", 0.0)
    
    dev_pct = row.get("deviation_pct", 0)
    streak = row.get("consecutive_anomaly_count", 0)
    
    if status == "Normal":
        if dev_pct < -20 and streak >= 3:
            status = "Critical"
        elif dev_pct < -10 or streak >= 2:
            status = "Warning"
            
    if status == "Critical":
        if ae_score > 0:
            reasons.append(f"Autoencoder detected critical anomaly (Score: {ae_score:.2f}). Root cause: {root_cause}.")
        else:
            reasons.append(f"Output {abs(dev_pct):.1f}% below expected for {int(streak)} consecutive readings.")
    elif status == "Warning":
        if ae_score > 0:
            reasons.append(f"Autoencoder detected warning (Score: {ae_score:.2f}). Root cause check: {root_cause}.")
        else:
            reasons.append(f"Slight underperformance ({abs(dev_pct):.1f}%).")
            
    if not reasons:
        reasons.append("Operating within expected bounds.")
        
    return status, reasons
