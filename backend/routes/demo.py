from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
import sys
import os
import asyncio
import logging
import random
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.session import get_db
from db.models import Alert
from schemas.responses import InjectFaultRequest
from cache.analytics_store import store
from pipeline.orchestrator import run_pipeline
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/demo")
logger = logging.getLogger(__name__)

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
            if q in clients:
                clients.remove(q)
            
    return EventSourceResponse(event_generator())

_playback_task = None

async def playback_loop():
    logger.info("Playback loop started.")
    previous_active_risk_ids = set()
    while True:
        try:
            is_playing = False
            speed = 100
            with store.lock:
                is_playing = store.is_playing
                speed = store.playback_speed
                
            if not is_playing:
                await asyncio.sleep(0.5)
                continue
                
            sleep_time = max(0.05, 0.5 / float(speed))
            await asyncio.sleep(sleep_time)
            
            with store.lock:
                first_aid = list(store.full_raw_data.keys())[0] if store.full_raw_data else None
                if first_aid and store.playback_cursor >= len(store.full_raw_data[first_aid]):
                    # Loop back to the beginning (or rather, start of the window)
                    store.playback_cursor = 96
                
                store.playback_cursor += 1

            asset_ids = list(store.full_raw_data.keys())
            active_risk_ids = []
            
            for aid in asset_ids:
                df_raw = store.get_raw(aid)
                if df_raw is None or df_raw.empty:
                    continue
                
                if aid in store.injected_faults:
                    fault = store.injected_faults[aid]
                    start_mutate = max(0, len(df_raw) - 12)
                    target_idx = df_raw.index[start_mutate:]
                    
                    req_type = fault["type"]
                    req_mag = fault["magnitude"]
                    
                    if req_type == "inverter_thermal_derating":
                        df_raw.loc[target_idx, "actual_power"] *= (1 - req_mag)
                        if "module_temp_c" in df_raw.columns:
                            df_raw.loc[target_idx, "module_temp_c"] += (req_mag * 15)
                    elif req_type in ("inverter_underperformance", "soiling"):
                        reduction = req_mag if req_type == "inverter_underperformance" else req_mag * 0.5
                        df_raw.loc[target_idx, "actual_power"] *= (1 - reduction)
                    elif req_type == "sensor_fault":
                        mean_pwr = df_raw.loc[target_idx, "actual_power"].mean()
                        noise = (random.random() - 0.5) * req_mag * mean_pwr
                        df_raw.loc[target_idx, "actual_power"] += noise
                    elif req_type == "gearbox_wear":
                        df_raw.loc[target_idx, "actual_power"] *= (1 - (req_mag * 0.2))
                        if "vibration_mm_s" in df_raw.columns:
                            df_raw.loc[target_idx, "vibration_mm_s"] += (req_mag * 2)

                df_processed = run_pipeline(aid, df_raw)
                store.update_processed(aid, df_processed)
                
                if not df_processed.empty:
                    last_row = df_processed.iloc[-1]
                    if last_row.get("decision_status") == "Inspect Now":
                        active_risk_ids.append(aid)

            import json
            payload = json.dumps({
                "type": "playback_update",
                "active_risk_ids": active_risk_ids
            })
            notify_clients(payload)
            
            # Time Dilation: Pause for 2 seconds if a NEW risk is detected
            current_risk_set = set(active_risk_ids)
            new_risks = current_risk_set - previous_active_risk_ids
            if new_risks:
                await asyncio.sleep(2.0)
            previous_active_risk_ids = current_risk_set

        except Exception as e:
            logger.error(f"Playback error: {e}")
            await asyncio.sleep(1.0)

def start_playback_engine():
    global _playback_task
    if _playback_task is None:
        loop = asyncio.get_event_loop()
        _playback_task = loop.create_task(playback_loop())

@router.on_event("startup")
async def startup_event():
    start_playback_engine()

class PlaybackSpeedRequest(BaseModel):
    speed: int

@router.get("/playback/state")
def get_playback_state():
    return store.get_playback_state()

@router.post("/playback/play")
def play_playback():
    with store.lock:
        store.is_playing = True
    notify_clients("playback_started")
    return {"status": "success", "state": store.get_playback_state()}

@router.post("/playback/pause")
def pause_playback():
    with store.lock:
        store.is_playing = False
    notify_clients("playback_paused")
    return {"status": "success", "state": store.get_playback_state()}

@router.post("/playback/speed")
def set_playback_speed(req: PlaybackSpeedRequest):
    with store.lock:
        store.playback_speed = max(1, req.speed)
    notify_clients("playback_speed_changed")
    return {"status": "success", "state": store.get_playback_state()}


@router.post("/inject-fault")
def inject_fault(req: InjectFaultRequest, db: Session = Depends(get_db)):
    with store.lock:
        store.injected_faults[req.asset_id] = {
            "type": req.fault_type,
            "magnitude": req.fault_magnitude
        }
        
    df_raw = store.get_raw(req.asset_id)
    if df_raw is not None:
        target_idx = df_raw.index[-12:]
        if req.fault_type == "inverter_thermal_derating":
            df_raw.loc[target_idx, "actual_power"] *= (1 - req.fault_magnitude)
            if "module_temp_c" in df_raw.columns:
                df_raw.loc[target_idx, "module_temp_c"] += (req.fault_magnitude * 15)
        elif req.fault_type in ("inverter_underperformance", "soiling"):
            reduction = req.fault_magnitude if req.fault_type == "inverter_underperformance" else req.fault_magnitude * 0.5
            df_raw.loc[target_idx, "actual_power"] *= (1 - reduction)
        elif req.fault_type == "sensor_fault":
            mean_pwr = df_raw.loc[target_idx, "actual_power"].mean()
            noise = (random.random() - 0.5) * req.fault_magnitude * mean_pwr
            df_raw.loc[target_idx, "actual_power"] += noise
        elif req.fault_type == "gearbox_wear":
            df_raw.loc[target_idx, "actual_power"] *= (1 - (req.fault_magnitude * 0.2))
            if "vibration_mm_s" in df_raw.columns:
                df_raw.loc[target_idx, "vibration_mm_s"] += (req.fault_magnitude * 2)

        df_processed = run_pipeline(req.asset_id, df_raw)
        store.update_processed(req.asset_id, df_processed)
        
        last_row = df_processed.iloc[-1]
        alert = Alert(
            asset_id=req.asset_id,
            severity="Critical" if last_row.get("decision_status") == "Inspect Now" else "Warning",
            message=f"Fault Injected: {req.fault_type.replace('_', ' ').title()}",
            recommended_action=last_row.get("recommended_action", f"Inspect {req.asset_id}.")
        )
        db.add(alert)
        db.commit()
        
    notify_clients(f"asset_updated:{req.asset_id}")
    return {"status": "success", "message": f"Injected {req.fault_type} into {req.asset_id}"}


@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
    with store.lock:
        store.full_raw_data.clear()
        store.processed_data.clear()
        store.injected_faults.clear()
        store.playback_cursor = 96
        store.is_playing = False
        
    db.query(Alert).delete()
    from db.models import AssetHealth, Asset
    db.query(AssetHealth).delete()
    db.query(Asset).delete()
    db.commit()
    
    notify_clients("demo_reset")
    return {"status": "success", "message": "All assets cleared"}

def do_seed():
    from db.session import SessionLocal
    db = SessionLocal()
    try:
        from db.seed import seed_database
        from db.models import Asset
        seed_database(db, force=True)
        
        asset_ids = [a.id for a in db.query(Asset).all()]
        store.load_from_disk(asset_ids)
        
        for aid in asset_ids:
            df_raw = store.get_raw(aid)
            if df_raw is not None and not df_raw.empty:
                df_processed = run_pipeline(aid, df_raw)
                store.update_processed(aid, df_processed)
                
        notify_clients("demo_reset")
    finally:
        db.close()

@router.post("/seed")
def seed_demo(background_tasks: BackgroundTasks):
    background_tasks.add_task(do_seed)
    return {"status": "success", "message": "Assets loading in background..."}


@router.post("/resolve/{asset_id}")
def resolve_issue(asset_id: str, db: Session = Depends(get_db)):
    with store.lock:
        if asset_id in store.injected_faults:
            del store.injected_faults[asset_id]
            
    df_raw = store.get_raw(asset_id)
    if df_raw is not None:
        df_processed = run_pipeline(asset_id, df_raw)
        store.update_processed(asset_id, df_processed)
        
    db.query(Alert).filter(Alert.asset_id == asset_id, Alert.message.like("Fault Injected:%")).delete()
    db.commit()
    
    notify_clients(f"asset_updated:{asset_id}")
    return {"status": "success", "message": f"Issue resolved for {asset_id}"}
