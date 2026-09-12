import os
import yaml
import logging

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "..", "config")
os.makedirs(CONFIG_DIR, exist_ok=True)

weights = {
    "w1_failure_probability": 0.35,
    "w2_revenue_risk": 0.30,
    "w3_severity": 0.20,
    "w4_asset_criticality": 0.10,
    "w5_persistence": 0.05
}

with open(os.path.join(CONFIG_DIR, "priority_weights.yaml"), "w") as f:
    yaml.dump(weights, f)
