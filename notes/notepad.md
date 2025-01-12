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

select a.id, "accClass", "accLeaf", "accName", 
            CASE WHEN "accLeaf" = 'L' THEN 'Ledger' ELSE 'Group' END || ': ' || "accClass" || ': ' || "accName"
                as "fullName"
            from
                "AccM" a
                    join "AccClassM" c
                        on c.id = a."classId"
            where
                "accLeaf" in('L','N')
            order by "accLeaf", "accClass", "accName"

updateBlock_editAccount