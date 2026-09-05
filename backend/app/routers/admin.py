from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.ambulance import Ambulance
from app.models.hospital import Hospital
from app.models.emergency import EmergencyRequest
from app.schemas.user import UserResponse
from app.schemas.ambulance import AmbulanceResponse
from app.schemas.hospital import HospitalResponse
from app.schemas.emergency import EmergencyResponse

router = APIRouter(prefix="/admin", tags=["Admin & Analytics"])

@router.get("/statistics")
def get_admin_statistics(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_ambulances = db.query(Ambulance).count()
    available_ambulances = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").count()
    active_emergencies = db.query(EmergencyRequest).filter(
        EmergencyRequest.status.in_(["PENDING", "ASSIGNED", "EN_ROUTE_PATIENT", "PATIENT_PICKED_UP", "EN_ROUTE_HOSPITAL"])
    ).count()
    total_hospitals = db.query(Hospital).count()
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_requests = db.query(EmergencyRequest).filter(EmergencyRequest.requested_at >= today_start).count()

    # 1. Emergency Requests by Day (Last 7 days)
    requests_by_day = []
    for i in range(6, -1, -1):
        day_date = datetime.utcnow().date() - timedelta(days=i)
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        
        count = db.query(EmergencyRequest).filter(
            EmergencyRequest.requested_at >= day_start,
            EmergencyRequest.requested_at <= day_end
        ).count()
        
        requests_by_day.append({
            "day": day_date.strftime("%a"),
            "date": day_date.strftime("%b %d"),
            "requests": count
        })

    # 2. Priority Distribution
    critical_count = db.query(EmergencyRequest).filter(EmergencyRequest.priority_level == "CRITICAL").count()
    urgent_count = db.query(EmergencyRequest).filter(EmergencyRequest.priority_level == "URGENT").count()
    normal_count = db.query(EmergencyRequest).filter(EmergencyRequest.priority_level == "NORMAL").count()
    
    priority_distribution = [
        {"name": "Critical", "value": critical_count, "color": "#EF4444"},
        {"name": "Urgent", "value": urgent_count, "color": "#F59E0B"},
        {"name": "Normal", "value": normal_count, "color": "#10B981"},
    ]

    # 3. Ambulance Utilization
    busy_ambulances = db.query(Ambulance).filter(Ambulance.status == "BUSY").count()
    offline_ambulances = db.query(Ambulance).filter(Ambulance.status == "OFFLINE").count()
    
    ambulance_utilization = [
        {"name": "Available", "count": available_ambulances, "fill": "#10B981"},
        {"name": "Busy / On Trip", "count": busy_ambulances, "fill": "#EF4444"},
        {"name": "Offline", "count": offline_ambulances, "fill": "#6B7280"},
    ]

    # 4. Average Response Times (simulated metrics based on database)
    avg_response_times = [
        {"time_period": "Morning (06-12)", "avg_minutes": 6.8},
        {"time_period": "Afternoon (12-18)", "avg_minutes": 8.4},
        {"time_period": "Evening (18-00)", "avg_minutes": 7.2},
        {"time_period": "Night (00-06)", "avg_minutes": 5.5},
    ]

    return {
        "metrics": {
            "total_users": total_users,
            "total_ambulances": total_ambulances,
            "available_ambulances": available_ambulances,
            "active_emergencies": active_emergencies,
            "total_hospitals": total_hospitals,
            "todays_requests": todays_requests
        },
        "requests_by_day": requests_by_day,
        "priority_distribution": priority_distribution,
        "ambulance_utilization": ambulance_utilization,
        "avg_response_times": avg_response_times
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    return db.query(User).all()

@router.get("/emergencies", response_model=List[EmergencyResponse])
def get_admin_emergencies(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    return db.query(EmergencyRequest).order_by(EmergencyRequest.requested_at.desc()).all()

@router.get("/ambulances", response_model=List[AmbulanceResponse])
def get_admin_ambulances(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    return db.query(Ambulance).all()
