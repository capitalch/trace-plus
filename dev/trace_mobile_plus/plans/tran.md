# instructions
- Create business_health_page
    - AppBar: Business Health  unitName
    - Body: Set of key value pairs to be displayed in form of report
        - Keys are
            Sundry Creditors
            Sundry Debtors
            Bank Accounts
            Cash-in-Hand
            Purchase Account
            Sales Account
            Opening Stock
            Opening Stock (GST)
            Closing Stock
            Closing Stock (GST)
            (a) Profit or loss as per balance sheet
            Difference inStock
            (b) Difference in stock (GST)

            Business Index (a + b)
    - sqlId for query to get above values in JSON format is getBusinessHealth in SqlIdsMap. sqlArgs are: branchId, finYearId, buCode, dbParams
    - create business_health_model and business_health_provider
    - follow the pattern as per sales_page whereever required
    - Complete th business_health_page and integrate it with router, main and dashboard_page
    - signatue of sql output data is as below. This will be useful to create the model. You need to take out above values from this JSON and populate the provider. Then display the values in the business_health_page
       jsonResult: {
        "stockDiff": {
            "diff": -195224,
            "diffGst": -231066
        },
        "profitLoss": -116272,
        "openingClosingStock": {
            "openingValue": 9152967,
            "openingValueWithGst": 10802043,
            "closingValue": 8957743,
            "closingValueWithGst": 10570977
        },
        "trialBalance": [
            {
            "id": 2,
            "parentId": null,
            "accName": "Capital Account",
            "closing": -10571559
            },
            {
            "id": 3,
            "parentId": 2,
            "accName": "Capital Account Subgroup",
            "closing": -10571559
            },
            {
            "id": 4,
            "parentId": 3,
            "accName": "Capital",
            "closing": -8850789
            },
            {
            "id": 6,
            "parentId": null,
            "accName": "Current Liabilities",
            "closing": -2433349
            },
            {
            "id": 7,
            "parentId": 6,
            "accName": "Duties & Taxes",
            "closing": 0
            },
            {
            "id": 9,
            "parentId": 6,
            "accName": "Sundry Creditors",
            "closing": -758771
            },
            {
            "id": 10,
            "parentId": null,
            "accName": "Loans Liability",
            "closing": -3060012
            },
            {
            "id": 13,
            "parentId": 10,
            "accName": "Unsecured Loans",
            "closing": -3060012
            },
            {
            "id": 15,
            "parentId": null,
            "accName": "Current Assets",
            "closing": 11735743
            },
            {
            "id": 16,
            "parentId": 15,
            "accName": "Bank Accounts",
            "closing": 147779
            },
            {
            "id": 17,
            "parentId": 15,
            "accName": "Cash-in-Hand",
            "closing": 689057
            },
            {
            "id": 20,
            "parentId": 15,
            "accName": "Stock in Hand",
            "closing": 8289921
            },
            {
            "id": 21,
            "parentId": 15,
            "accName": "Loans & Advances (Asset)",
            "closing": 39100
            },
            {
            "id": 22,
            "parentId": 15,
            "accName": "Sundry Debtors",
            "closing": 159641
            },
            {
            "id": 24,
            "parentId": null,
            "accName": "Investments",
            "closing": 1312220
            },
            {
            "id": 25,
            "parentId": null,
            "accName": "Indirect Expences",
            "closing": 1051234
            },
            {
            "id": 26,
            "parentId": null,
            "accName": "Purchase Accounts",
            "closing": 46137676
            },
            {
            "id": 29,
            "parentId": null,
            "accName": "Indirect Incomes",
            "closing": -212593
            },
            {
            "id": 30,
            "parentId": null,
            "accName": "Sales Account",
            "closing": -46860045
            }
        ]
        }

