from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Alert
from ..schemas.responses import InjectFaultRequest
from ..cache.analytics_store import store
from ..pipeline.orchestrator import run_pipeline
import logging
import random
from sse_starlette.sse import EventSourceResponse
import asyncio

router = APIRouter(prefix="/demo")
logger = logging.getLogger(__name__)

# Very simple global state for SSE clients
clients = []

def notify_clients(message: str):
    for q in clients:
        q.put_nowait(message)

@router.get("/stream")
async def message_stream():
    q = asyncio.Queue()
    clients.append(q)
    
    async def event_generator():
        try:
            while True:
                msg = await q.get()
                yield {"data": msg}
        except asyncio.CancelledError:
            clients.remove(q)
            
    return EventSourceResponse(event_generator())

@router.post("/inject-fault")
def inject_fault(req: InjectFaultRequest, db: Session = Depends(get_db)):
    # 1. Get raw baseline data
    df_raw = store.get_raw(req.asset_id)
    if df_raw is None:
        raise HTTPException(status_code=404, detail="Asset not found in memory")
        
    df_injected = df_raw.copy()
    
    # 2. Mutate last 12 rows based on fault type
    target_idx = df_injected.index[-12:]
    
    if req.fault_type == "inverter_thermal_derating":
        df_injected.loc[target_idx, "actual_power"] *= (1 - req.fault_magnitude)
        if "module_temp_c" in df_injected.columns:
            df_injected.loc[target_idx, "module_temp_c"] += (req.fault_magnitude * 15)

    elif req.fault_type in ("inverter_underperformance", "soiling"):
        # Both produce a uniform power reduction without temperature change
        reduction = req.fault_magnitude if req.fault_type == "inverter_underperformance" else req.fault_magnitude * 0.5
        df_injected.loc[target_idx, "actual_power"] *= (1 - reduction)

    elif req.fault_type == "sensor_fault":
        mean_pwr = df_injected.loc[target_idx, "actual_power"].mean()
        noise = (random.random() - 0.5) * req.fault_magnitude * mean_pwr
        df_injected.loc[target_idx, "actual_power"] += noise

    elif req.fault_type == "gearbox_wear":
        df_injected.loc[target_idx, "actual_power"] *= (1 - (req.fault_magnitude * 0.2))
        if "vibration_mm_s" in df_injected.columns:
            df_injected.loc[target_idx, "vibration_mm_s"] += (req.fault_magnitude * 2)

    # 3. Re-run pipeline
    df_processed = run_pipeline(req.asset_id, df_injected)
    
    # 4. Update cache
    store.update_processed(req.asset_id, df_processed)
    
    # 5. Create alert
    last_row = df_processed.iloc[-1]
    alert = Alert(
        asset_id=req.asset_id,
        severity="Critical" if last_row.get("decision_status") == "Inspect Now" else "Warning",
        message=f"Fault Injected: {req.fault_type.replace('_', ' ').title()}",
        recommended_action=last_row.get("recommended_action", f"Inspect {req.asset_id}.")
    )
    db.add(alert)
    db.commit()
    
    # 6. Notify frontend
    notify_clients(f"asset_updated:{req.asset_id}")
    
    return {"status": "success", "message": f"Injected {req.fault_type} into {req.asset_id}"}

@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
    # 1. Restore all from raw
    for aid in list(store.raw_data.keys()):
        df_raw = store.get_raw(aid)
        df_processed = run_pipeline(aid, df_raw)
        store.update_processed(aid, df_processed)
        
    # 2. Clear injected alerts
    db.query(Alert).filter(Alert.message.like("Fault Injected:%")).delete()
    db.commit()
    
    # 3. Notify frontend
    notify_clients("demo_reset")
    
    return {"status": "success", "message": "Demo reset to baseline"}

@router.post("/resolve/{asset_id}")
def resolve_issue(asset_id: str, db: Session = Depends(get_db)):
    # 1. Restore specific asset from raw
    df_raw = store.get_raw(asset_id)
    if df_raw is None:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    df_processed = run_pipeline(asset_id, df_raw)
    store.update_processed(asset_id, df_processed)
    
    # 2. Clear related injected alerts
    db.query(Alert).filter(Alert.asset_id == asset_id, Alert.message.like("Fault Injected:%")).delete()
    db.commit()
    
    # 3. Notify frontend
    notify_clients(f"asset_updated:{asset_id}")
    
    return {"status": "success", "message": f"Issue resolved for {asset_id}"}
