# write unit tests for the function distance_between_two_geo_locations
# the function is in file main_copilot.py which is in the same directory as this file
# the function takes 4 arguments: lat1, lon1, lat2, lon2
# the function returns the distance in kilometers
# use the assert function to test the function
# run the test from the terminal using the command: python3 -m unittest test-geolocation.py

import unittest
from main_copilot import distance_between_two_geo_locations
from main_copilot import distance_between_two_geo_locations
class TestGeoLocation(unittest.TestCase):
    def test_distance_between_two_geo_locations(self):
        # Test case 1
        lat1 = 37.7749
        lon1 = -122.4194
        lat2 = 34.0522
        lon2 = -118.2437
        expected_distance = 559.2
        distance = distance_between_two_geo_locations(lat1, lon1, lat2, lon2)
        self.assertAlmostEqual(distance, expected_distance, places=1)

        # Test case 2
        lat1 = 40.7128
        lon1 = -74.0060
        lat2 = 51.5074
        lon2 = -0.1278
        expected_distance = 5577.8
        distance = distance_between_two_geo_locations(lat1, lon1, lat2, lon2)
        self.assertAlmostEqual(distance, expected_distance, places=1)

if __name__ == '__main__':
    unittest.main()

