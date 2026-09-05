from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.emergency import EmergencyRequest
from app.models.patient import PatientInformation
from app.models.ambulance import Ambulance
from app.models.hospital import Hospital
from app.models.user import User
from app.schemas.emergency import EmergencyCreate
from app.ai.priority_engine import PriorityEngine
from app.utils.distance import haversine_distance
from app.services.notification_service import NotificationService

class EmergencyService:

    @staticmethod
    def create_emergency(db: Session, patient_id: int, emergency_in: EmergencyCreate) -> EmergencyRequest:
        # 1. Calculate Emergency Priority Score via AI Rule Engine
        priority_res = PriorityEngine.calculate_priority(
            emergency_type=emergency_in.emergency_type,
            patient_info=emergency_in.patient_info
        )
        
        # 2. Find nearest available ambulance
        available_ambulances = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").all()
        
        assigned_ambulance: Optional[Ambulance] = None
        closest_distance: float = float("inf")
        
        if available_ambulances:
            # Sort ambulances by distance to patient
            distance_list: List[Tuple[Ambulance, float]] = []
            for amb in available_ambulances:
                dist = haversine_distance(
                    emergency_in.patient_latitude,
                    emergency_in.patient_longitude,
                    amb.latitude,
                    amb.longitude
                )
                distance_list.append((amb, dist))
                
            distance_list.sort(key=lambda x: x[1])
            assigned_ambulance, closest_distance = distance_list[0]

        # 3. Find nearest available hospital
        hospitals = db.query(Hospital).filter(Hospital.emergency_available == "AVAILABLE").all()
        assigned_hospital: Optional[Hospital] = None
        if hospitals:
            hospital_distances = [
                (h, haversine_distance(emergency_in.patient_latitude, emergency_in.patient_longitude, h.latitude, h.longitude))
                for h in hospitals
            ]
            hospital_distances.sort(key=lambda x: x[1])
            assigned_hospital = hospital_distances[0][0]

        # 4. Create Emergency Request record
        initial_status = "ASSIGNED" if assigned_ambulance else "PENDING"
        
        emergency = EmergencyRequest(
            patient_id=patient_id,
            ambulance_id=assigned_ambulance.id if assigned_ambulance else None,
            hospital_id=assigned_hospital.id if assigned_hospital else None,
            emergency_type=emergency_in.emergency_type,
            description=emergency_in.description,
            patient_latitude=emergency_in.patient_latitude,
            patient_longitude=emergency_in.patient_longitude,
            priority_score=priority_res["score"],
            priority_level=priority_res["level"],
            status=initial_status,
            requested_at=datetime.utcnow()
        )
        db.add(emergency)
        db.commit()
        db.refresh(emergency)

        # 5. Create associated PatientInformation details if provided
        if emergency_in.patient_info:
            info = PatientInformation(
                emergency_id=emergency.id,
                age_group=emergency_in.patient_info.age_group,
                conscious=emergency_in.patient_info.conscious,
                breathing_difficulty=emergency_in.patient_info.breathing_difficulty,
                major_injury=emergency_in.patient_info.major_injury,
                chest_pain=emergency_in.patient_info.chest_pain,
                additional_notes=emergency_in.patient_info.additional_notes
            )
            db.add(info)
            db.commit()

        # 6. Update assigned ambulance status to BUSY
        if assigned_ambulance:
            assigned_ambulance.status = "BUSY"
            db.commit()
            
            # Notify Patient
            NotificationService.create_notification(
                db=db,
                user_id=patient_id,
                title="Ambulance Assigned 🚑",
                message=f"Ambulance {assigned_ambulance.vehicle_number} has been assigned to your location ({closest_distance} km away).",
                type_="SUCCESS"
            )
            
            # Notify Driver if assigned
            if assigned_ambulance.driver_id:
                NotificationService.create_notification(
                    db=db,
                    user_id=assigned_ambulance.driver_id,
                    title="🚨 New Emergency Dispatch",
                    message=f"New {priority_res['level']} emergency ({emergency_in.emergency_type}) assigned to you.",
                    type_="EMERGENCY"
                )
        else:
            # Notify Patient if no ambulance available
            NotificationService.create_notification(
                db=db,
                user_id=patient_id,
                title="No Ambulance Available ⚠️",
                message="No ambulance is currently available. Please contact local emergency services immediately (112 / 911 / 108).",
                type_="WARNING"
            )

        # Notify Hospital admins if hospital assigned
        if assigned_hospital:
            hospital_users = db.query(User).filter(User.role == "HOSPITAL").all()
            for h_user in hospital_users:
                NotificationService.create_notification(
                    db=db,
                    user_id=h_user.id,
                    title="Incoming Emergency Patient 🏥",
                    message=f"New {priority_res['level']} case arriving at {assigned_hospital.name}.",
                    type_="INFO"
                )

        # Notify System Admins
        admin_users = db.query(User).filter(User.role == "ADMIN").all()
        for admin in admin_users:
            NotificationService.create_notification(
                db=db,
                user_id=admin.id,
                title="System Emergency Alert 🚨",
                message=f"Emergency #{emergency.id} [{priority_res['level']}] created.",
                type_="INFO"
            )

        db.refresh(emergency)
        return emergency

    @staticmethod
    def update_status(db: Session, emergency_id: int, new_status: str) -> EmergencyRequest:
        emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
        if not emergency:
            raise HTTPException(status_code=404, detail="Emergency request not found")

        emergency.status = new_status
        now = datetime.utcnow()

        if new_status == "ASSIGNED" and not emergency.accepted_at:
            emergency.accepted_at = now
        elif new_status == "EN_ROUTE_PATIENT" and not emergency.accepted_at:
            emergency.accepted_at = now
        elif new_status == "PATIENT_PICKED_UP":
            emergency.picked_up_at = now
        elif new_status == "COMPLETED":
            emergency.completed_at = now
            # Free up the assigned ambulance
            if emergency.ambulance:
                emergency.ambulance.status = "AVAILABLE"

        elif new_status == "CANCELLED":
            if emergency.ambulance:
                emergency.ambulance.status = "AVAILABLE"

        db.commit()
        db.refresh(emergency)
        return emergency
