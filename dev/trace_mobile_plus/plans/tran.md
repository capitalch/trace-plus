# instructions for implementing General ledger
- Provide a button "Select Account" in AppBar. It opens a modal window with a dropDown to select an account name. id and accNames are populated from graphql call. Typing in the box will narrow down the search. Finally user can select an account by clicking it. The id of account is selected. sqlId for this is getLeafSubledgerAccountsOnClass. sqlArgs are accClassNames which is 'debtor, creditor'. The sample output from graphQL call is in acc.json
- based on selected id, graphQL call is made and all transactions of that id is fetched. The sqlId is getAccountLedger. sqlArgs are accId, finYearId and branchId
- The data output type of getAccountLedger is like in file ledger.json
- The transactions are displayed as below. Each transaction is a card. 
    - 1st line is date, autoRefNo, userRefNo, amount(right aligned) with dr or cr.
    - 2nd line: otherAccounts, type, instr, refNo, lineRemarks and remarks
    - 2nd line can max up to 3 lines
- A summary showing op, debit, credit and closing is at the top
- Create provider, model and UI for General Ledger and do implementation

