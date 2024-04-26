# write a function to create distance between two geo locations on earth
from cmath import asin, cos, sin
from math import radians, sqrt

def distance_between_two_geo_locations(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r    
# return the distance in miles
print(distance_between_two_geo_locations(32.9697, -96.80322, 29.46786, -98.53506)) # 262.3 miles    
# return the distance in kilometers
print(distance_between_two_geo_locations(32.9697, -96.80322, 29.46786, -98.53506)) # 421.5 km

