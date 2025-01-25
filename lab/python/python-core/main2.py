def get_sql(xData):
    # cond1 = xData.get("id", None)
    # cond2 = not xData.get("isIdInsert", None)
    if (xData.get("id", None)) and (not xData.get("isIdInsert", None)):
        return "update"
    else:
        return "insert"


print(get_sql({"id": None, "isIdInsert": None}))
print(get_sql({"id": None, "isIdInsert": True}))
print(get_sql({"id": 100, "isIdInsert": None}))
print(get_sql({"id": 100, "isIdInsert": True}))

# a= None
# if(a):
#     print(True)
# else:
#     print(False)
