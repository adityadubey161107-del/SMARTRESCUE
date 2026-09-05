from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.emergency import EmergencyRequest
from app.models.ambulance import Ambulance
from app.schemas.emergency import (
    EmergencyCreate, EmergencyResponse, EmergencyStatusUpdate, PriorityResult
)
from app.services.emergency_service import EmergencyService
from app.ai.priority_engine import PriorityEngine

router = APIRouter(prefix="/emergencies", tags=["Emergencies"])

@router.post("", response_model=EmergencyResponse, status_code=status.HTTP_201_CREATED)
def create_emergency(
    emergency_in: EmergencyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return EmergencyService.create_emergency(db=db, patient_id=current_user.id, emergency_in=emergency_in)

@router.post("/triage-preview", response_model=PriorityResult)
def preview_triage_score(emergency_in: EmergencyCreate):
    res = PriorityEngine.calculate_priority(
        emergency_type=emergency_in.emergency_type,
        patient_info=emergency_in.patient_info
    )
    return res

@router.get("", response_model=List[EmergencyResponse])
def list_emergencies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        return db.query(EmergencyRequest).filter(EmergencyRequest.patient_id == current_user.id).order_by(EmergencyRequest.requested_at.desc()).all()
    elif current_user.role == "DRIVER":
        # Driver sees assigned emergencies
        driver_amb = db.query(Ambulance).filter(Ambulance.driver_id == current_user.id).first()
        if not driver_amb:
            return []
        return db.query(EmergencyRequest).filter(EmergencyRequest.ambulance_id == driver_amb.id).order_by(EmergencyRequest.requested_at.desc()).all()
    elif current_user.role == "HOSPITAL":
        return db.query(EmergencyRequest).order_by(EmergencyRequest.requested_at.desc()).all()
    else: # ADMIN
        return db.query(EmergencyRequest).order_by(EmergencyRequest.requested_at.desc()).all()

@router.get("/{emergency_id}", response_model=EmergencyResponse)
def get_emergency(
    emergency_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    return emergency

@router.patch("/{emergency_id}/status", response_model=EmergencyResponse)
def update_emergency_status(
    emergency_id: int,
    status_update: EmergencyStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return EmergencyService.update_status(db=db, emergency_id=emergency_id, new_status=status_update.status)

@router.post("/{emergency_id}/cancel", response_model=EmergencyResponse)
def cancel_emergency(
    emergency_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return EmergencyService.update_status(db=db, emergency_id=emergency_id, new_status="CANCELLED")
