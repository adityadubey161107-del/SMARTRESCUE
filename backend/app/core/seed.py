from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.hospital import Hospital
from app.models.ambulance import Ambulance
from app.models.emergency import EmergencyRequest
from app.models.patient import PatientInformation
from app.models.notification import Notification

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # Check if users already exist
        if db.query(User).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding database with demo data...")
        default_pwd_hash = get_password_hash("password123")

        # 1. Create Users
        patient_user = User(
            name="Rahul Sharma (Patient)",
            email="patient@example.com",
            phone="+91 9876543210",
            password_hash=default_pwd_hash,
            role="PATIENT"
        )
        
        driver_user = User(
            name="Vikram Singh (Driver)",
            email="driver@example.com",
            phone="+91 9876543211",
            password_hash=default_pwd_hash,
            role="DRIVER"
        )
        
        driver2_user = User(
            name="Amit Patel (Driver 2)",
            email="driver2@example.com",
            phone="+91 9876543214",
            password_hash=default_pwd_hash,
            role="DRIVER"
        )

        hospital_user = User(
            name="CityCare Hospital Admin",
            email="hospital@example.com",
            phone="+91 9876543212",
            password_hash=default_pwd_hash,
            role="HOSPITAL"
        )

        admin_user = User(
            name="System Administrator",
            email="admin@example.com",
            phone="+91 9876543213",
            password_hash=default_pwd_hash,
            role="ADMIN"
        )

        db.add_all([patient_user, driver_user, driver2_user, hospital_user, admin_user])
        db.commit()
        db.refresh(patient_user)
        db.refresh(driver_user)
        db.refresh(driver2_user)
        db.refresh(hospital_user)

        # 2. Create Hospitals
        hospital_1 = Hospital(
            name="CityCare Multi-Specialty Hospital",
            address="102 Health Avenue, Central District",
            phone="+91 80 2345 6789",
            latitude=12.9780,
            longitude=77.5980,
            emergency_available="AVAILABLE"
        )
        
        hospital_2 = Hospital(
            name="St. Jude Emergency Medical Center",
            address="45 Rescue Boulevard, South Park",
            phone="+91 80 2345 9999",
            latitude=12.9650,
            longitude=77.6050,
            emergency_available="AVAILABLE"
        )

        hospital_3 = Hospital(
            name="Apex Trauma & Critical Care",
            address="88 Metro Highway, North Ridge",
            phone="+91 80 2345 1111",
            latitude=12.9850,
            longitude=77.5850,
            emergency_available="AVAILABLE"
        )

        db.add_all([hospital_1, hospital_2, hospital_3])
        db.commit()
        db.refresh(hospital_1)
        db.refresh(hospital_2)

        # 3. Create Ambulances
        amb_1 = Ambulance(
            vehicle_number="AMB-001",
            type="ALS",
            status="AVAILABLE",
            latitude=12.9730,
            longitude=77.5920,
            driver_id=driver_user.id,
            hospital_id=hospital_1.id
        )

        amb_2 = Ambulance(
            vehicle_number="AMB-002",
            type="ALS",
            status="AVAILABLE",
            latitude=12.9680,
            longitude=77.6010,
            driver_id=driver2_user.id,
            hospital_id=hospital_2.id
        )

        amb_3 = Ambulance(
            vehicle_number="AMB-003",
            type="BLS",
            status="AVAILABLE",
            latitude=12.9820,
            longitude=77.5890,
            hospital_id=hospital_3.id
        )

        amb_4 = Ambulance(
            vehicle_number="AMB-004",
            type="BLS",
            status="AVAILABLE",
            latitude=12.9600,
            longitude=77.5950,
            hospital_id=hospital_1.id
        )

        amb_5 = Ambulance(
            vehicle_number="AMB-005",
            type="ALS",
            status="OFFLINE",
            latitude=12.9900,
            longitude=77.6100,
            hospital_id=hospital_2.id
        )

        db.add_all([amb_1, amb_2, amb_3, amb_4, amb_5])
        db.commit()

        # 4. Create Initial Sample Emergency Request for demonstration
        sample_emergency = EmergencyRequest(
            patient_id=patient_user.id,
            ambulance_id=amb_1.id,
            hospital_id=hospital_1.id,
            emergency_type="Chest Pain",
            description="Patient experiencing severe pressure in chest and shortness of breath.",
            patient_latitude=12.9716,
            patient_longitude=77.5946,
            priority_score=65,
            priority_level="CRITICAL",
            status="ASSIGNED",
            requested_at=datetime.utcnow() - timedelta(minutes=15)
        )
        db.add(sample_emergency)
        db.commit()
        db.refresh(sample_emergency)

        sample_info = PatientInformation(
            emergency_id=sample_emergency.id,
            age_group="Adult",
            conscious=True,
            breathing_difficulty=True,
            major_injury=False,
            chest_pain=True,
            additional_notes="History of hypertension"
        )
        db.add(sample_info)

        # 5. Create Sample Notifications
        n1 = Notification(
            user_id=patient_user.id,
            title="Emergency Request Received",
            message="Your emergency request has been received. Ambulance AMB-001 is on the way.",
            type="EMERGENCY"
        )
        n2 = Notification(
            user_id=driver_user.id,
            title="New Emergency Assigned",
            message="Critical emergency request assigned: Chest Pain near Central Square.",
            type="EMERGENCY"
        )
        n3 = Notification(
            user_id=hospital_user.id,
            title="Incoming Patient Alert",
            message="Ambulance AMB-001 is transporting a Critical chest pain patient.",
            type="INFO"
        )
        db.add_all([n1, n2, n3])
        db.commit()

        print("Database successfully seeded with demo accounts & emergency records!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
