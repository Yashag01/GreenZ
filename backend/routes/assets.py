from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import sys
import os
import pandas as pd
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.session import get_db
from db.models import Asset, AssetHealth
from schemas.responses import AssetSummary, AssetDetail
from schemas.requests import AssetUpdate
from cache.analytics_store import store
from routes.demo import notify_clients

router = APIRouter()


def _safe_float(val, default=0.0):
    try:
        v = float(val)
        return v if pd.notna(v) else default
    except (TypeError, ValueError):
        return default


def _ranked_conditions_from_row(last_row):
    """Extract and validate ranked_conditions from a dataframe row."""
    ranked_conds = last_row.get("ranked_conditions")
    if isinstance(ranked_conds, str):
        import json
        try:
            ranked_conds = json.loads(ranked_conds)
        except Exception:
            ranked_conds = []
    if not isinstance(ranked_conds, list):
        ranked_conds = []
    # Ensure each entry has expected fields
    validated = []
    for c in ranked_conds:
        if isinstance(c, dict) and "condition_name" in c:
            conf_raw = c.get("confidence")
            conf = None if (conf_raw is None or (isinstance(conf_raw, float) and pd.isna(conf_raw))) else str(conf_raw)
            validated.append({
                "condition_name": c.get("condition_name", "Unknown"),
                "confidence": conf,  # str label or None
                "evidence": c.get("evidence", []),
            })
    return validated


@router.get("/assets", response_model=List[AssetSummary])
def get_assets(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()

    results = []
    for a in assets:
        df = store.get_processed(a.id)
        if df is not None and not df.empty:
            last_row = df.iloc[-1]
            summary = {
                "id": a.id,
                "name": a.name,
                "type": a.type,
                "location": a.location,
                "status": last_row.get("decision_status", last_row.get("status", "Monitor")),
                "decision_status": last_row.get("decision_status", last_row.get("status", "Monitor")),
                "failure_risk": _safe_float(last_row.get("failure_risk")),
                "fault_type": str(last_row.get("fault_type", "None")),
                "ranked_conditions": _ranked_conditions_from_row(last_row),
                "recommended_action": str(last_row.get("recommended_action", "Continue routine monitoring.")),
                "energy_at_risk": _safe_float(last_row.get("energy_at_risk")),
                "revenue_at_risk": _safe_float(last_row.get("revenue_at_risk")),
                "priority_score": _safe_float(last_row.get("priority_score")),
                "priority_rank": 0,
                "expected_power": _safe_float(last_row.get("expected_power")) if "expected_power" in last_row else None,
                "deviation_pct": _safe_float(last_row.get("deviation_pct")) if "deviation_pct" in last_row else None,
                "actual_power": _safe_float(last_row.get("actual_power")) if "actual_power" in last_row else None,
            }
            results.append(summary)

    # Sort by priority score descending
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    for i, res in enumerate(results):
        res["priority_rank"] = i + 1

    return results


@router.get("/assets/{asset_id}", response_model=AssetDetail)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    a = db.query(Asset).filter(Asset.id == asset_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Asset not found")

    df = store.get_processed(asset_id)
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Asset data not processed yet")

    last_row = df.iloc[-1]
    ranked_conds = _ranked_conditions_from_row(last_row)

    import json

    def _parse_json_list(raw_val):
        if not raw_val:
            return []
        if isinstance(raw_val, list):
            return raw_val
        try:
            return json.loads(str(raw_val))
        except Exception:
            return []

    reasons = _parse_json_list(last_row.get("flag_reasons"))
    action_immediate = _parse_json_list(last_row.get("action_immediate"))
    action_inspect = _parse_json_list(last_row.get("action_inspect"))
    action_long_term = _parse_json_list(last_row.get("action_long_term"))

    # Handle NaN confidence values
    fault_conf_raw = last_row.get("fault_confidence")
    fault_conf = None if (fault_conf_raw is None or (isinstance(fault_conf_raw, float) and pd.isna(fault_conf_raw))) else str(fault_conf_raw)

    return {
        "id": a.id,
        "name": a.name,
        "type": a.type,
        "location": a.location,
        "status": str(last_row.get("status", "Monitor")),
        "decision_status": str(last_row.get("decision_status", "Monitor")),
        "failure_risk": _safe_float(last_row.get("failure_risk")),
        "fault_type": str(last_row.get("fault_type", "None")),
        "ranked_conditions": ranked_conds,
        "recommended_action": str(last_row.get("recommended_action", "Continue routine monitoring.")),
        "energy_at_risk": _safe_float(last_row.get("energy_at_risk")),
        "revenue_at_risk": _safe_float(last_row.get("revenue_at_risk")),
        "priority_score": _safe_float(last_row.get("priority_score")),
        "priority_rank": 0,
        "expected_power": _safe_float(last_row.get("expected_power")) if "expected_power" in last_row else None,
        "deviation_pct": _safe_float(last_row.get("deviation_pct")) if "deviation_pct" in last_row else None,
        "actual_power": _safe_float(last_row.get("actual_power")) if "actual_power" in last_row else None,
        "model_status": str(last_row.get("model_status", "N/A")),
        "capacity_kw": _safe_float(a.capacity_kw),
        "reasons": reasons,
        "action_immediate": action_immediate,
        "action_inspect": action_inspect,
        "action_long_term": action_long_term,
        "fault_confidence": fault_conf,
    }


@router.get("/assets/{asset_id}/history")
def get_asset_history(asset_id: str):
    df = store.get_processed(asset_id)
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Asset data not found")

    # Return last 96 rows (24h at 15-min intervals)
    df_tail = df.tail(96).copy()

    # Sanitize non-serializable columns
    for col in df_tail.columns:
        if df_tail[col].dtype == object:
            df_tail[col] = df_tail[col].astype(str)

    df_tail = df_tail.fillna(0)
    df_tail["timestamp"] = df_tail["timestamp"].astype(str)

    return df_tail.to_dict(orient="records")


@router.get("/priority-list", response_model=List[AssetSummary])
def get_priority_list(db: Session = Depends(get_db)):
    return get_assets(db)

@router.put("/assets/{asset_id}")
def update_asset(asset_id: str, update_data: AssetUpdate, db: Session = Depends(get_db)):
    a = db.query(Asset).filter(Asset.id == asset_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    update_dict = update_data.model_dump(exclude_unset=True) if hasattr(update_data, "model_dump") else update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(a, key, value)
        
    db.commit()
    notify_clients(f"asset_updated:{asset_id}")
    return {"status": "success", "message": "Asset updated"}

@router.delete("/assets/{asset_id}")
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    a = db.query(Asset).filter(Asset.id == asset_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    db.query(AssetHealth).filter(AssetHealth.asset_id == asset_id).delete()
    db.delete(a)
    db.commit()
    
    store.delete_asset(asset_id)
    notify_clients(f"asset_deleted:{asset_id}")
    return {"status": "success", "message": "Asset deleted"}
