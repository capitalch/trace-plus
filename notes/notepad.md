## Different steps for Hierarchy accounts
- Step 1: Basic without recursion: Array_agg for children
- Step 2: With recursion array_agg
- Step 3: Basic without recursion json_agg
- Step 4: With recursion json_agg

I have following tables in an accounting system PostgreSql. I want to create trial balance:
1) AccM: As Accounts Master: id, accCode, accName, accType(L forliability, A for Asset, E for expences, I for Income), parentId
2) AccOpBal: For opening balances of accounts: id, accId, dc(D for Debits, C for Credits), amount
3) TranD: For transaction details: id, accId, dc (D for Debits, C for Credits), amount
Create a trial balance query to be consumed by Syncfusion TreeGrid. It should be hierarchal. The parentId column defines the hierarchy in AccM table

"@syncfusion/ej2-base": "^27.2.5",
    "@syncfusion/ej2-pdf-export": "^27.2.2",
    "@syncfusion/ej2-react-buttons": "^27.2.4",
    "@syncfusion/ej2-react-dropdowns": "^27.2.5",
    "@syncfusion/ej2-react-grids": "^27.2.5",
    "@syncfusion/ej2-react-popups": "^27.2.2",
    "@syncfusion/ej2-react-treegrid": "^27.2.3",

@syncfusion/ej2-base @syncfusion/ej2-pdf-export @syncfusion/ej2-react-buttons @syncfusion/ej2-react-dropdowns @syncfusion/ej2-react-grids @syncfusion/ej2-react-popups @syncfusion/ej2-react-treegrid