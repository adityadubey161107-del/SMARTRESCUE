from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="PATIENT") # PATIENT, DRIVER, HOSPITAL, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    driver_ambulances = relationship("Ambulance", back_populates="driver", foreign_keys="Ambulance.driver_id")
    patient_emergencies = relationship("EmergencyRequest", back_populates="patient", foreign_keys="EmergencyRequest.patient_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
