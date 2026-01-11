# Fix the bug
- This bug only happens when apk is installed in physical device
- This bug also does not occur when _openAccountSelectionModal(): line 34 is commented out in general_ledger_page. In this case automatic modal window is turned off and modal window appears on manual selection from button. On manual firing of modal window and then account selection this bug does not appear.
- The bug is:
    - In general_ledger_page an account is selected from modal window
    - When an account is selected for ledger output, the screen shows never ending busy indicator. No accounts ledger is visible. Only busy indicator for ever.
- can auto firing of modal window be done through some other mechanism other than writing _openAccountSelectionModal() in initState() method?


