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

    expected, model_status = compute_expected_power(asset_id, df, capacity_kw)
    df["expected_power"] = expected

    df = compute_deviation_metrics(df)

    df["asset_criticality"] = 0.5
    
    from .anomaly_detector import detect_anomalies_vectorized
    df = detect_anomalies_vectorized(asset_id, df)

    def process_row(row):
        status, reasons = detect_anomalies(row)

        if status == "Normal":
            decision = "Monitor"
        elif status == "Warning":
            decision = "Watch" if row.get("consecutive_anomaly_count", 0) < 3 else "Schedule Inspection"
        else:
            decision = "Inspect Now"

        fault_type, conf, ranked, action_plan = classify_fault(row, decision)
        
        risk = compute_failure_risk(row)
        
        row_for_econ = row.copy()
        row_for_econ["failure_risk"] = risk
        e_risk, r_risk = compute_economics(row_for_econ, tariff)
        
        row_for_prio = row_for_econ.copy()
        row_for_prio["revenue_at_risk"] = r_risk
        row_for_prio["status"] = decision
        score = compute_priority(row_for_prio)

        import json
        return pd.Series({
            "status": decision,
            "decision_status": decision,
            "flag_reasons": json.dumps(reasons),
            "action_immediate": json.dumps(action_plan.get("immediate", [])),
            "action_inspect": json.dumps(action_plan.get("inspect", [])),
            "action_long_term": json.dumps(action_plan.get("long_term", [])),
            "fault_type": fault_type,
            "fault_confidence": conf,
            "ranked_conditions": ranked,
            "recommended_action": action_plan.get("immediate", [""])[0] if action_plan.get("immediate") else "Continue monitoring.",
            "failure_risk": risk,
            "energy_at_risk": e_risk,
            "revenue_at_risk": r_risk,
            "priority_score": score
        })

    if not df.empty:
        results = df.apply(process_row, axis=1)
        for col in results.columns:
            df[col] = results[col]
    else:
        for col in ["status", "decision_status", "flag_reasons", "action_immediate", "action_inspect", "action_long_term", "fault_type", "fault_confidence", "ranked_conditions", "recommended_action", "failure_risk", "energy_at_risk", "revenue_at_risk", "priority_score"]:
            df[col] = pd.Series(dtype='object')
            
    df["model_status"] = model_status

    return df
