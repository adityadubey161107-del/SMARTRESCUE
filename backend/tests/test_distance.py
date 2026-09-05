from app.utils.distance import haversine_distance, calculate_eta

def test_haversine_same_location():
    dist = haversine_distance(12.9716, 77.5946, 12.9716, 77.5946)
    assert dist == 0.0

def test_haversine_known_distance():
    # Distance between Bengaluru City Center (12.9716, 77.5946) and Indiranagar (12.9784, 77.6408) is ~5 km
    dist = haversine_distance(12.9716, 77.5946, 12.9784, 77.6408)
    assert 4.0 <= dist <= 6.0

def test_calculate_eta():
    eta = calculate_eta(15.0, average_speed_kmh=45.0)
    assert eta == 20 # 15 km at 45 km/h is 20 minutes
