# Fix the bug
- In general_ledger_page an account is selected in modal window
- When in web application, ledger of selected accounts is properly displayed
- When an apk is created and deployed in physical device everything is working. But when an account is selected for ledger output, the screen shows never ending busy indicator. No accounts ledger is visible. Only busy indicator for ever.
- For test purpose I commented the line 33 _openAccountSelectionModal() in general_ledger_page and created a new button in appBar to show a fixed account ledger. Clicking this new iconButton (check) shows the ledger for fixed account correctly
- It appears that opening a modal and selecting an account from modal gives some sort of sync issue which does not happen when clicked the button directly to show the ledger

