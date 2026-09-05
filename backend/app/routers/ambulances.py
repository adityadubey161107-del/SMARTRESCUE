from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ambulance import Ambulance
from app.models.patient import AmbulanceLocation
from app.models.emergency import EmergencyRequest
from app.schemas.ambulance import (
    AmbulanceResponse, AmbulanceUpdateStatus, AmbulanceUpdateLocation
)
from app.schemas.emergency import EmergencyResponse

router = APIRouter(prefix="/ambulances", tags=["Ambulances"])

@router.get("", response_model=List[AmbulanceResponse])
def get_all_ambulances(db: Session = Depends(get_db)):
    return db.query(Ambulance).all()

@router.get("/available", response_model=List[AmbulanceResponse])
def get_available_ambulances(db: Session = Depends(get_db)):
    return db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").all()

@router.get("/my-ambulance", response_model=AmbulanceResponse)
def get_my_ambulance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    amb = db.query(Ambulance).filter(Ambulance.driver_id == current_user.id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="No ambulance assigned to this driver")
    return amb

@router.get("/{ambulance_id}", response_model=AmbulanceResponse)
def get_ambulance_by_id(ambulance_id: int, db: Session = Depends(get_db)):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb

@router.patch("/{ambulance_id}/status", response_model=AmbulanceResponse)
def update_ambulance_status(
    ambulance_id: int,
    status_in: AmbulanceUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    
    amb.status = status_in.status.upper()
    db.commit()
    db.refresh(amb)
    return amb

@router.post("/{ambulance_id}/accept", response_model=EmergencyResponse)
def accept_emergency(
    ambulance_id: int,
    emergency_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not amb or not emergency:
        raise HTTPException(status_code=404, detail="Ambulance or Emergency not found")
    
    amb.status = "BUSY"
    emergency.status = "EN_ROUTE_PATIENT"
    emergency.accepted_at = datetime.utcnow()
    emergency.ambulance_id = amb.id
    
    db.commit()
    db.refresh(emergency)
    return emergency

@router.post("/{ambulance_id}/location", response_model=AmbulanceResponse)
def update_ambulance_location(
    ambulance_id: int,
    loc_in: AmbulanceUpdateLocation,
    db: Session = Depends(get_db)
):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    
    amb.latitude = loc_in.latitude
    amb.longitude = loc_in.longitude
    
    # Save location history
    history = AmbulanceLocation(
        ambulance_id=amb.id,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        speed=loc_in.speed or 0.0,
        timestamp=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    db.refresh(amb)
    return amb
