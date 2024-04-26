class TestDistanceBetweenTwoGeoLocations(unittest.TestCase):
    def test_distance_same_location(self):
        # Test when the two locations are the same
        lat1, lon1 = 37.7749, -122.4194
        lat2, lon2 = 37.7749, -122.4194
        expected_distance = 0
        actual_distance = distance_between_two_geo_locations(lat1, lon1, lat2, lon2)
        self.assertEqual(actual_distance, expected_distance)

    def test_distance_different_locations(self):
        # Test when the two locations are different
        lat1, lon1 = 37.7749, -122.4194
        lat2, lon2 = 34.0522, -118.2437
        expected_distance = 559.2  # Approximate distance in kilometers
        actual_distance = distance_between_two_geo_locations(lat1, lon1, lat2, lon2)
        self.assertAlmostEqual(actual_distance, expected_distance, places=1)

    def test_distance_negative_longitude(self):
        # Test when one of the longitudes is negative
        lat1, lon1 = 37.7749, -122.4194
        lat2, lon2 = 37.7749, 122.4194
        expected_distance = 0
        actual_distance = distance_between_two_geo_locations(lat1, lon1, lat2, lon2)
        self.assertEqual(actual_distance, expected_distance)

    def test_distance_negative_latitude(self):
        # Test when one of the latitudes is negative
        lat1, lon1 = -37.7749, -122.4194
        lat2, lon2 = 37.7749, -122.4194
        expected_distance = 0
        actual_distance = distance_between_two_geo_locations(lat1, lon1, lat2, lon2)
        self.assertEqual(actual_distance, expected_distance)


if __name__ == "__main__":
    unittest.main()
