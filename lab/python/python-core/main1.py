def parse_bearer_token(s):
    if ((not s) or (not s.strip())):
        return None
    if s.startswith("Bearer "):
        return s[len("Bearer "):].strip()
    return s

# Test examples
test_cases = [
    None,
    "",
    "   ",
    "Bearer SomeToken",
    "JustSomeString"
]

for test in test_cases:
    print(f"Input: {repr(test)} | Parsed Token: {parse_bearer_token(test)}")
