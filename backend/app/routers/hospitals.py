from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalResponse, HospitalUpdateAvailability
from app.utils.distance import haversine_distance

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("", response_model=List[HospitalResponse])
def get_all_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).all()

@router.get("/nearby", response_model=List[HospitalResponse])
def get_nearby_hospitals(
    lat: float = Query(...),
    lon: float = Query(...),
    db: Session = Depends(get_db)
):
    hospitals = db.query(Hospital).all()
    # Sort hospitals by distance from given lat/lon
    hospitals_sorted = sorted(
        hospitals,
        key=lambda h: haversine_distance(lat, lon, h.latitude, h.longitude)
    )
    return hospitals_sorted

@router.get("/{hospital_id}", response_model=HospitalResponse)
def get_hospital_by_id(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@router.patch("/{hospital_id}/availability", response_model=HospitalResponse)
def update_hospital_availability(
    hospital_id: int,
    avail_in: HospitalUpdateAvailability,
    db: Session = Depends(get_db)
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    hospital.emergency_available = avail_in.emergency_available.upper()
    db.commit()
    db.refresh(hospital)
    return hospital
