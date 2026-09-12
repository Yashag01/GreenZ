def compute_failure_risk(row):
    """
    Computes heuristic failure risk score (0-100%).
    """
    risk = 0.0
    
    # Absolute deviation contribution (up to 35%)
    dev_pct = abs(row.get("deviation_pct", 0))
    risk += min(dev_pct * 1.5, 35.0)
    
    # Anomaly streak contribution (up to 35%)
    streak = row.get("consecutive_anomaly_count", 0)
    risk += min(streak * 10.0, 35.0)
    
    # Degradation trend (up to 15%)
    trend = row.get("degradation_trend", 0)
    if trend < -5:
        risk += 15.0
    elif trend < 0:
        risk += abs(trend) * 3.0
        
    # Temperature/vibration anomalies (up to 15%)
    if "module_temp_c" in row:
        if row["module_temp_c"] > 70:
            risk += 15.0
    elif "vibration_mm_s" in row:
        if row["vibration_mm_s"] > 2.0:
            risk += 15.0
            
    return min(risk, 100.0)
