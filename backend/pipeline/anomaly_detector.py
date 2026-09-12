def detect_anomalies(row):
    """
    Returns state: "Normal", "Warning", or "Critical",
    plus a reason string.
    """
    reasons = []
    status = "Normal"
    
    dev_pct = row.get("deviation_pct", 0)
    streak = row.get("consecutive_anomaly_count", 0)
    
    is_solar = "module_temp_c" in row
    
    if dev_pct < -20 and streak >= 3:
        status = "Critical"
        reasons.append(f"Output {abs(dev_pct):.1f}% below expected for {int(streak)} consecutive readings.")
    elif is_solar and row.get("module_temp_c", 0) > 75 and dev_pct < -10:
        status = "Critical"
        reasons.append(f"High module temp ({row['module_temp_c']:.1f}°C) with {abs(dev_pct):.1f}% power loss.")
    elif dev_pct < -10 or streak >= 2:
        if status != "Critical":
            status = "Warning"
        reasons.append(f"Slight underperformance ({abs(dev_pct):.1f}%).")
        
    if not reasons:
        reasons.append("Operating within expected bounds.")
        
    return status, reasons
