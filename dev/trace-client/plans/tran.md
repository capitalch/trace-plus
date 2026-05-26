# Optimize functioning of vouchers
- Analyse thoroughly the vouchers folder
- For large no of accounts say for around 1500, the loading of VoucherLineItemEntry becomes very slow.
- When adding a new row, sometimes DB query is executed multiple times.
- Overall response is very slow
- Need a complete plan to improve vouchers
- Check client and server side codes to suggest a robust plan. Write your plan to plans/plan.md file