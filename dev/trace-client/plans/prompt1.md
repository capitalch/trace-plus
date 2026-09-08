# Goal: To show a new account in Sales → Payment Details → Payment Methods → "Payment Account" dropdown when row index !== 0 or > 0
- the new account is of className = 'cashback'

# Suggested Implementation
- A new row is added in table AccClassMaster as 'cashback', id = 17
- User can add a new group of accType 'A' by using existing UI for adding new group accounts.  The group's classname is cashback.
- User can further add some leaf accounts under the above group, or can add ledgers with subledgers under the above group.
- the intention is additionally, all the above leaf accounts and subledger accounts appear in the "Payment Account" dropdown for each row (i.e., for index !== 0 or > 0).

# To Do
- If above implementation achieves the goal, comment on that in plan1.md
- Give a complete implementation plan with detailed steps in plan1.md
