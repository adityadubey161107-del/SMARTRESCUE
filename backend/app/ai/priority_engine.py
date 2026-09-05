from typing import Optional, Dict, Any
from app.schemas.emergency import PatientInfoCreate

class PriorityEngine:
    """
    Emergency Priority Decision-Support Engine.
    
    DISCLAIMER: This system provides emergency prioritization decision support
    for resource allocation and dispatch optimization. It is NOT a medical diagnosis system
    and does not replace clinical triage by medical professionals.
    """
    
    @staticmethod
    def calculate_priority(emergency_type: str, patient_info: Optional[PatientInfoCreate] = None) -> Dict[str, Any]:
        score = 0
        breakdown = {}
        
        # Base score based on emergency type
        type_lower = emergency_type.lower()
        if "unconscious" in type_lower:
            score += 40
            breakdown["Emergency Type (Unconscious)"] = 40
        elif "chest pain" in type_lower or "cardiac" in type_lower or "heart attack" in type_lower:
            score += 35
            breakdown["Emergency Type (Chest Pain/Cardiac)"] = 35
        elif "breathing" in type_lower or "respiratory" in type_lower:
            score += 40
            breakdown["Emergency Type (Breathing Issue)"] = 40
        elif "accident" in type_lower or "injury" in type_lower or "trauma" in type_lower:
            score += 30
            breakdown["Emergency Type (Accident/Injury)"] = 30
        elif "stroke" in type_lower or "seizure" in type_lower:
            score += 35
            breakdown["Emergency Type (Neurological)"] = 35
        else:
            score += 15
            breakdown["Emergency Type (General/Other)"] = 15
            
        # Clinical parameters from patient triage info
        if patient_info:
            if not patient_info.conscious:
                score += 40
                breakdown["Unconscious Patient"] = 40
                
            if patient_info.breathing_difficulty:
                score += 40
                breakdown["Breathing Difficulty"] = 40
                
            if patient_info.major_injury:
                score += 30
                breakdown["Major Physical Trauma/Injury"] = 30
                
            if patient_info.chest_pain:
                score += 25
                breakdown["Severe Chest Pain"] = 25

            if patient_info.age_group == "Senior" or patient_info.age_group == "Infant":
                score += 10
                breakdown[f"High-Risk Age Group ({patient_info.age_group})"] = 10

        # Cap score between 0 and 100 for normalization
        final_score = min(score, 100)

        if final_score >= 60:
            level = "CRITICAL"
        elif final_score >= 30:
            level = "URGENT"
        else:
            level = "NORMAL"

        return {
            "score": final_score,
            "level": level,
            "breakdown": breakdown,
            "disclaimer": "Emergency decision-support score for dispatch prioritization only."
        }
