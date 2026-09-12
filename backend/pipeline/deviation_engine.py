import pandas as pd
import numpy as np

def compute_deviation_metrics(df, eps=1e-3, rolling_window=12):
    """
    Computes percentage deviation and rolling anomaly trends.
    rolling_window=12 assumes 15-min intervals (3 hours).
    """
    df = df.copy()
    
    # Deviation Percentage
    # Formula: (actual - expected) / expected * 100
    df["deviation_pct"] = (df["actual_power"] - df["expected_power"]) / np.maximum(df["expected_power"].abs(), eps) * 100.0
    
    # AIZAR Logic: power_deviation and rolling_mean_power
    df["rolling_mean_power"] = df["actual_power"].rolling(window=6, min_periods=1).mean()
    df["power_deviation"] = df["actual_power"] - df["rolling_mean_power"]
    
    # AIZAR Logic: temp_trend
    temp_col = "internal_temp" if "internal_temp" in df.columns else "module_temp_c"
    if temp_col not in df.columns:
        temp_col = "ambient_temp_c" # fallback
    
    if temp_col in df.columns:
        df["temp_diff"] = df[temp_col].diff().fillna(0)
        df["temp_trend"] = df["temp_diff"].rolling(window=6, min_periods=1).mean()
    else:
        df["temp_trend"] = 0.0
    
    # We only care about deviation when expected power is somewhat significant.
    mask = df["expected_power"] < (df["actual_power"].max() * 0.05)
    df.loc[mask, "deviation_pct"] = 0.0
    
    # Rolling metrics
    df["rolling_mean_dev"] = df["deviation_pct"].rolling(window=rolling_window, min_periods=1).mean()
    df["rolling_std_dev"] = df["deviation_pct"].rolling(window=rolling_window, min_periods=1).std().fillna(0)
    
    is_anomalous = (df["deviation_pct"] < -15.0).astype(int)
    streak_id = (is_anomalous != is_anomalous.shift(1)).cumsum()
    df["consecutive_anomaly_count"] = is_anomalous.groupby(streak_id).cumsum()
    df["degradation_trend"] = df["rolling_mean_dev"].diff(periods=96).fillna(0)
    
    return df
