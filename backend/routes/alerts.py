from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..db.models import Alert
from ..schemas.responses import AlertResponse

router = APIRouter()

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(50).all()
    return alerts
