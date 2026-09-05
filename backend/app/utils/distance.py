import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in kilometers.
    """
    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula 
    dlat = lat2 - lat1 
    dlon = lon2 - lon1 
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers.
    
    return round(c * r, 2)

def calculate_eta(distance_km: float, average_speed_kmh: float = 45.0) -> int:
    """
    Calculate estimated time of arrival (ETA) in minutes based on distance and average speed.
    """
    if average_speed_kmh <= 0:
        return 0
    time_hours = distance_km / average_speed_kmh
    eta_minutes = int(round(time_hours * 60))
    return max(eta_minutes, 1) # Minimum 1 minute ETA
