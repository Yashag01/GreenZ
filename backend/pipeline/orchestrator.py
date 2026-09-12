import pandas as pd
import logging
from .expected_model import compute_expected_power
from .deviation_engine import compute_deviation_metrics
from .anomaly_detector import detect_anomalies
from .fault_classifier import classify_fault
from .failure_risk import compute_failure_risk
from .economic_model import compute_economics
from .prioritizer import compute_priority

logger = logging.getLogger(__name__)

def run_pipeline(asset_id, df_asset, capacity_kw=None, tariff=None):
    """
    Runs the full analytical pipeline for a single asset.
    Expects df_asset to be chronological actuals.
    All outputs are derived from real data — no hardcoded overrides.
    """
    df = df_asset.copy()

    # 1. Expected Model
    expected, model_status = compute_expected_power(asset_id, df, capacity_kw)
    df["expected_power"] = expected

    # 2. Deviation Engine
    df = compute_deviation_metrics(df)

    statuses = []
    reasons_list = []
    faults = []
    confidences = []
    ranked_list = []
    action_list = []
    risks = []
    energy_risks = []
    rev_risks = []
    scores = []

    df["asset_criticality"] = 0.5

    for idx, row in df.iterrows():
        # 3. Anomaly Detection
        status, reasons = detect_anomalies(row)

        # Map to decision status
        if status == "Normal":
            decision = "Monitor"
        elif status == "Warning":
            decision = "Watch" if row.get("consecutive_anomaly_count", 0) < 3 else "Schedule Inspection"
        else:
            decision = "Inspect Now"

        statuses.append(decision)
        reasons_list.append(" | ".join(reasons))

        # 4. Fault Classification
        fault_type, conf, ranked, action = classify_fault(row, decision)
        faults.append(fault_type)
        confidences.append(conf)
        ranked_list.append(ranked)
        action_list.append(action)

        # 5. Failure Risk Score
        risk = compute_failure_risk(row)
        risks.append(risk)
        row["failure_risk"] = risk

        # 6. Energy & Revenue at Risk
        e_risk, r_risk = compute_economics(row, tariff)
        energy_risks.append(e_risk)
        rev_risks.append(r_risk)
        row["revenue_at_risk"] = r_risk

        # 7. Priority Score
        row["status"] = decision
        score = compute_priority(row)
        scores.append(score)

    df["status"] = statuses
    df["decision_status"] = statuses
    df["reasons"] = reasons_list
    df["fault_type"] = faults
    df["fault_confidence"] = confidences
    df["ranked_conditions"] = ranked_list
    df["recommended_action"] = action_list
    df["failure_risk"] = risks
    df["energy_at_risk"] = energy_risks
    df["revenue_at_risk"] = rev_risks
    df["priority_score"] = scores
    df["model_status"] = model_status

    return df
