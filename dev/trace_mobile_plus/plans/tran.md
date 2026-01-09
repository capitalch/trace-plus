# instructions for implementing Opening Balance in General Ledger transactions
- opBalance is part of jsonResult as in ledger.json file
- Consider only debit and credit of opBalance
- formattedOpBalance is {
    debit,
    credit,
    "otherAccounts": "Opening balance:",
    "tranDate": finYear?.startDate,
    "autoRefNo": '',
    "instrNo": ''
}
- inject formattedOpBalance at beginning of ledger transactions
- create model for opBalance and do necessary changes so that opening balance appears at the begining of transactions

