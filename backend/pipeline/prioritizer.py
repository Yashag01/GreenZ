import yaml
import os

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "priority_weights.yaml")

def load_weights():
    default_weights = {
        "w1_failure_probability": 0.35,
        "w2_revenue_risk": 0.30,
        "w3_severity": 0.20,
        "w4_asset_criticality": 0.10,
        "w5_persistence": 0.05
    }
    
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            try:
                weights = yaml.safe_load(f)
                return weights if weights else default_weights
            except:
                pass
    return default_weights

def compute_priority(row):
    weights = load_weights()
    
    f_prob = row.get("failure_risk", 0) / 100.0
    
    rev_risk = row.get("revenue_at_risk", 0)
    rev_norm = min(rev_risk / 50000.0, 1.0)
    
    status = row.get("status", "Normal")
    sev_map = {"Critical": 1.0, "Warning": 0.5, "Normal": 0.0}
    sev_norm = sev_map.get(status, 0.0)
    
    crit_norm = row.get("asset_criticality", 0.5)
    
    streak = row.get("consecutive_anomaly_count", 0)
    pers_norm = min(streak / 10.0, 1.0)
    
    score = (
        weights["w1_failure_probability"] * f_prob +
        weights["w2_revenue_risk"] * rev_norm +
        weights["w3_severity"] * sev_norm +
        weights["w4_asset_criticality"] * crit_norm +
        weights["w5_persistence"] * pers_norm
    ) * 100.0
    
    return round(score, 1)
