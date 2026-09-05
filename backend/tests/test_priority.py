from app.ai.priority_engine import PriorityEngine
from app.schemas.emergency import PatientInfoCreate

def test_priority_critical():
    patient_info = PatientInfoCreate(
        conscious=False,
        breathing_difficulty=True,
        chest_pain=True,
        major_injury=False
    )
    result = PriorityEngine.calculate_priority(emergency_type="Unconscious / Breathing Issue", patient_info=patient_info)
    assert result["level"] == "CRITICAL"
    assert result["score"] >= 60

def test_priority_normal():
    patient_info = PatientInfoCreate(
        conscious=True,
        breathing_difficulty=False,
        chest_pain=False,
        major_injury=False
    )
    result = PriorityEngine.calculate_priority(emergency_type="Minor Sprain", patient_info=patient_info)
    assert result["level"] == "NORMAL"
    assert result["score"] < 30

def test_priority_urgent():
    patient_info = PatientInfoCreate(
        conscious=True,
        breathing_difficulty=False,
        chest_pain=False,
        major_injury=True
    )
    result = PriorityEngine.calculate_priority(emergency_type="Leg Fracture", patient_info=patient_info)
    assert result["level"] in ["URGENT", "CRITICAL"]
