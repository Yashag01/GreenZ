from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import threading
import sys
import os

from .db.session import engine, Base, SessionLocal
from .db.seed import seed_database
from .cache.analytics_store import store
from .pipeline.orchestrator import run_pipeline

from .routes import health, assets, alerts, demo, upload

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Predictive Maintenance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(demo.router, prefix="/api")
app.include_router(upload.router, prefix="/api")

def startup_pipeline_task():
    logger.info("Background initialization starting...")
    db = SessionLocal()
    try:
        force_reset = "--reset" in sys.argv or os.environ.get("SEED_FORCE_RESET", "false").lower() == "true"
        seed_database(db, force=force_reset)
        
        # Load asset IDs from DB
        from .db.models import Asset
        assets = db.query(Asset).all()
        asset_ids = [a.id for a in assets]
        
        # Load Raw Data into cache
        logger.info("Loading raw data into cache...")
        store.load_from_disk(asset_ids)
        
        # Process baseline
        logger.info("Running baseline analytics pipeline...")
        for aid in asset_ids:
            df_raw = store.get_raw(aid)
            if df_raw is not None and not df_raw.empty:
                df_processed = run_pipeline(aid, df_raw)
                store.update_processed(aid, df_processed)
                
        logger.info("Background initialization complete.")
    except Exception as e:
        logger.error(f"Startup task failed: {e}")
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    # Run in background to avoid blocking server start
    thread = threading.Thread(target=startup_pipeline_task)
    thread.start()

if __name__ == "__main__":
    port = int(os.environ.get("BACKEND_PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
