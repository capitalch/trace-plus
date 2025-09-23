# Instructions
- implement /api/pincode in file security_router.py
- create method resolve_pincode_helper in file security_helper.py
- The api endpoint reads the file postal_data.json and returns the country as India, city and state from json file against the pincode
- This is a GET request with the parameter pincode in the url as /{pincode}