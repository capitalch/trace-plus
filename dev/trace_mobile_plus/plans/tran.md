# instructions
- This is for transactions_page functionality which follows the same pattern as sales_page
- create a new folder by name transactions in features folder
- Transactions_page is report of all accounts transactions like sales, purchase and all vouchers
- On click of transactions card in dashboard_page the transactions_page is called
- Need to create transactions_provider just as sales_provider and set it in main.dart. Create   fields and methods in it following the same pattern of sales and as per requirement
- Create a transactions_page which is similar to sales_page with following artifacts:
    - sqlId for graphQl query is getAllTransactions in SqlIdsMap
    - the model fields are
        tranDate
        autoRefNo
        userRefNo
        remarks
        accName
        debit
        credit
        instrNo
        lineRefNo
        lineRemarks
        timestamp
        tranTypeId
    - parameters for query are:
        buCode,
        dbParams,
        sqlId,
        sqlArgs: {
            endDate
            finYearId
            branchId
            startDate
            tranTypeId 
            noOfRows: null,
        }
    - Transaction types are mapped to tranTypeId and are as follows:
        1: 'Journal',
        2: 'Payment',
        3: 'Receipt',
        4: 'Sales',
        5: 'Purchase',
        6: 'Contra',
        7: 'Debit note',
        8: 'Credit note',
        9: 'Sales return',
        10: 'Purchase return'
    - appBar will have text buttons as today ,2 Days, 3 Days, This week, 2 Weeks, 3 Weeks, This month, 2 months, 3 months, 6 months, This year
        - Click of a button will set startDate and endDate for query
        - There will be additional clickable Label showing Max count. Clicking will place options to select from 1000, 2000, 3000, 5000, All transactions. The label will be appended with count. Default selection is 1000. It will show as Max count: 1000, which is clickable
        - Clickable label can be placed in secondary appBar along with the selected date ranges
- Provide a nice looking UI with cards and good color combination. There can be large daa, so you can use layoutBuilders. No need for summary. Only no of rows count is required at the top of report.