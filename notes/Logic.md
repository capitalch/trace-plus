## Sales: Logic for autoSubledger: insert and update
- Client
    - Sends isAutoSubledger field in json
- Server
    - If isAutoSubledger: exec_sql_object_with_auto_subledger
        - exec_sql_object_with_auto_subledger: new method
            - similar to exec_sql_object
                - After handle_auto_ref_no
                    - call new method id = create_auto_subledger: creates new autoSubledger account and gets its id
                    - replace the autoSubledgerId in sqlObject
                    - proceed

## sales: Logic for computation
# onChange fires when data is changed by keyboard
# onValueChange fires when data value itself changes irrespective of what initiated it
# onValueChange is fired first then onChange
# Target is to handle when
    - search is done and priceGst is set by code: setLineItem
    - when any of qty, price, discount, priceGst is changed on keyb
# create following methods
                                                            - computeLineItemValues
                                                                - starting from priceGst calculates subtotal, cgst, sgst, igst, amount and sets those values in form
                                                            - setPrice
                                                                - calculates price from priceGst and other values
                                                                - setValue(price)
                                                            - setPriceGst
                                                                - calculates priceGst from price and other values
                                                                - setValue(priceGst)
# Logic
                                                            - On Search Executed: basically setLineItem
                                                                - setValue(priceGst)
                                                                - setPrice()
                                                                - computeLineItemValues
                                                            - onChange price
                                                                - setPriceGst()
                                                                - computeLineItemValues()
                                                                - onChange priceGst
                                                                    - setPrice()
                                                                    - computeLineItemValues()
                                                                - onChange qty
                                                                    - computeLineItemValues()
                                                                - onChange rate
                                                                    - setPrice()
                                                                    - computeLineItemValues()
                                                                - onChange discount
                                                                    - setPriceGst()
                                                                    - computeLineItemValues()

# Intended logic for security
✅ 1. Use HTTPS Only
Always serve both frontend and backend over HTTPS to prevent token theft over the network.

Enforce HTTPS with HSTS headers.

✅ 2. Short-Lived Access Tokens + Refresh Tokens
Use short-lived access tokens (e.g., 5–15 minutes).

Keep a refresh token (longer-lived) in HTTP-only secure cookies.

This limits the damage if an access token is stolen.

✅ 3. Bind Token to Client Fingerprint (Optional)
Attach some client fingerprinting data when issuing the token, such as:

User-Agent string

IP address (if not on mobile networks)

Device ID (if using PWA or native wrappers)
Then, validate these on each request (within reason — IP changes on mobile).

But note: this is not foolproof and can cause issues with NAT/shared IPs.

✅ 4. Token Rotation
Rotate access tokens every few minutes.

Detect if a token is reused (e.g., after it's been rotated), and revoke the session.

✅ 5. Add a Custom App Signature Header
To identify your client app (i.e. detect Postman/curl), do the following:

When building your app, include a unique App-Secret string in the code (obfuscate it).

On each request, the client sends a custom header like:

http
Copy
Edit
X-App-Signature: abc123xyz
The server validates this secret.

🔒 This is not unbreakable, but raises the bar. Don’t hardcode obvious secrets.

✅ 6. Content Security Policy (CSP) + CORS
CSP prevents your frontend from being injected with malicious code.

CORS should allow only your frontend origin(s), not *.

✅ 7. Request Rate Limiting / Throttling
Add request throttling on the server per token or IP.

Prevents brute-force abuse of leaked tokens.

✅ 8. Audit Logs + Anomaly Detection
Track:

Which IP used which token

Unexpected request patterns (e.g., batch updates from curl)

Set up alerts for high-risk behavior.

✅ 9. Don't Trust Client-Provided Table/Field Names
⚠️ You mentioned:
"I use JSON to update data which contains table name, field names..."

This is risky. Don’t allow the client to dynamically control:

table names

field names

SQL fragments

Instead, use internal mapping from validated field names to SQL operations.

✅ 10. Consider GraphQL Persisted Queries (Advanced)
To prevent arbitrary queries/mutations from being sent:

Only allow pre-approved persisted queries (hash-based).

Postman/curl can't forge these easily without access to your frontend build.

✅ 11. Use CSRF Protection for Sensitive Endpoints
Even if you're using access tokens, for cookie-based auth, CSRF tokens are needed.


# logic for initialization
- account-options-info: container for bu, finYear, branch
    - sets current bu in redux
    
    - business-units-options: container for bu's
        - displays current bu
        - fetches acc-settings, all branches, all finyears for the current bu
        - provides list for change of bu
    
    - fin-years-branches-options: container
        - sets current fin year and currentbranch in redux. Makes use of lastUsedFinYearId and lastUsedBranchId stored in redux through login

        - fin-years-options: container
            - displays current fin-year
            - makes possible the change in fin year and sets current fin year in redux state when user changes fin year
            - saves changed finYearId as last used finYearId in DB

        - branches-options: container
            - displays current branch
            - makes possible the change in branch and sets the newly selected branch in redux state
            - saves changed branchId in db as last used branchId
- to do
    - during logout set lastBuid, finYearId, buId against user in DB if found null

# Logic for checking gp in all reports: SR,SSR, TSR reports
                    - Sale transaction of a product in profit
                        - SR, SSR and TSR OK in Trace+
            - Repeat sales with discount
                - *** SSR problem in Trace when sold with discount in sales ***
                - All reports in Trace+ OK
                    - Do a purchase with discount and corresponding sale
                        - OK
                    - Sale transaction of a product incurring loss
                        - OK
            - Sale transaction of a product incurring loss also add sales discount
                - *** SSR problem in Trace  ***
                    - Normal sales return
                        - ** Trace: SR: Ok SSR: Error TSR: Error **
                        - Trace+  : Ok
                    - Sales return with discount
                        - ** Trace: SR: OK, SSR: Error, TSR: Error **
                        - Trace+: All OK
    - Stock journal of a product before sale
        - Trace: All OK
        - Trace+: All OK
        - Sale of the debited product 
            - After stock journal date
                Trace: SR: OK, SSR: Error in GP, TSR: Error in GP
                Trace+: All OK
            - Before stock journal date
                Trace: SR: Tran not showing, SSR: OK, TSR: OK
                Trace+: SR: Ok, SSR: OK, TSR: OK
        - Sale of credited product
            - After stock journal date
                Trace: SR: Ok, SSR: Error, TSR: OK
                Trace+: OK
            - Before stock journal date
                Trace: Ok
                Trace+: Ok
    
    - Branch transfer
# testing Branch Transfer stock transfer
- create a branch transfer
- check it in summary stock
- Do op balance transfer
- Check the balance
# Product categories
- Buttons
    - Child         : Only when isLeaf = false
    - Edit          : Always
    - Tag           : Always
    - ChangeParent  : Always
    - Delete        : isDeleteAllowed: no children, not isUsed
    
# Export logic
    - Params from client to server
        dbName, buCode, clientId, finYearId, branchId, exportName(BS, PL, TB, GST, VOUCHER, PAYMENT, RECEIPT, SALES, PURCHASE, ACCMASTER, Contra,),  fileFormat, dateFormat, 
# Test script
- Change of accCode and accName: Abm sales 1 to normal                              : Check changes in accCode and accName                                          :: OK
- LLS: Change abm sales from goods creditor to service creditor and back            : AccType and accClass of abm sales changes. But here no change                 :: OK
- LNS: Change abm sales parent from goods creditor to Sundry creditors              : Change accLeaf to Y (Leaf)                                                    :: OK
- NLY: Abm sales back from sundry creditors to goods creditors                      : Change accLeaf to S (subledger)                                               :: OK
- NLL: Change parent of Goods creditors from sundry creditors to Service creditors  : Since goods creditors has children, hence not allowed                         :: OK
- NLL: Change parent of Misc creditors from Sundry creditors to loans from private parties     : Check misc creditors accLeaf = 'S' and class and accType also changed accordingly:: OK
- NNY: Change interfoto parent from sundry creditors to current liabilities         : accType and accClass changes but here no changes                              :: OK
- NNY: Change InterFoto back to sundry creditors                                                                                                                    :: OK
- NLN: Change parent of Misc credtors group from sundry creditors to loans from private parties: Check misc creditors accLeaf = 'S' and class and accType also changed accordingly:: OK

- NNN: Change parent of Misc parties group1 from sundry creditors to Loans liability : Check that class and accType of misc parties group1 and group11 changes      :: OK
- NNL: Change parent of Misc parties group2 from sundry creditors to Loans liability : Check that class and accType of misc parties group2 and group22 changes      :: OK
## for parent change in AccM
- accLeaf: Y, N, L, S
- Parent can be N: Group, L: Ledger
- Me can be Y: Leaf, S: subledger, N: Group, L: ledger
- doCopyM   : copy parent's accType and classId to me
- doCopyC   : recursively copy parent's accType and classId to all my children and subchildren
-   Possible conditions: Only happens when parent is changed: NA conditions below do not exist
    
        parentAccLeaf    newParentAccLeaf    myAccLeaf
        N                   L                   S           NA
NLY     N                   L                   Y           Parent from group to ledger 1) Change me from Y to S 2) doCopyM
NLN     N                   L                   N           Parent from group to ledger 1) Don't allow if me has children 2) Otherwise change me to S 3) doCopyM
NLL     N                   L                   L           Parent from group to ledger 1) Don't allow if me has children 2) Otherwise change me to S 4) doCopyM

LNS     L                   N                   S           Parent from ledger to group 1) Change me to Y 2) doCopyM
        L                   N                   Y           NA
        L                   N                   N           NA
        L                   N                   L           NA


LLS     L                   L                   S           Parent id changes but remains as ledger 1) doCopyM
NNN     N                   N                   N           Parent id changes but remains as Group 1) doCopyC
        N                   N                   L           Parent id changes but remains as Group 1) doCopyC
NNY     N                   N                   Y           Parent id changes but remains as Group 1) doCopyM

- Server logic
    - args are %id, %parentId, %accCode, %accName, %accLeaf, %hasParentChanged
    - update AccM set accCode, accName, parentId, accLeaf where id = %accId
    - get parent accType, classId into parentAccType, parentClassId where id = @parentId
    - if %hasParentChanged then
        copy parentAccType, parentclassId to record where id = %accId and all recursive children
- Client logic before submit
    - component is passed parentId, parentAccLeaf, parentAccType, parentClassId, accId, accLeaf, hasChildren, accCode, accName
    - use react-select. OnChange parent get newParentAccLeaf
        if(parentAccLeaf === 'N' && newParentAccLeaf === L)
            change xData.accType to S
            doCopyM
        if(NLN or NLL)
            if(hasChildren) 
                error message
        else
            change xData.accType to S
            doCopyM
        if(LNS)
            change xData.accType to Y
            doCopyM

## Client side side menu
- In SideMenu.tsx find current menuItem from redux selector and get corresponding menu data from master-menu-data.ts
## **Authentication mechanism**
- isLogin is false by default, so login screen is displayed; Otherwise based on type of user, the menu screen will be displayed
- Login screen submit button sends username and password to server /login endpoint
- At fastApi /login endpoint, request is send to **OAuth2PasswordRequestForm** fastapi method; It just provides out username and password as "formdata". The "formdata" is used to create bundle for SuperAdmin(S) or Admin(A) or business user(B). Bundle is sent to client along with accessToken JWT generated
- We do not generate refresh token for simplicity and more security. This will enable frequent login
- Client sets isLogin true and sets accessToken in SignalsStore
- Now due to refresh nature of SignalsStore the menu screen is shown based on logged in user type for SuperAdmin(S), Admin(A), Business user(B)
- At client every request to GraphQL api is secured and accessToken is auto inserted in header as Bearer
- At server whenever a secured request is made authentication of token is required. So every such request is passed through is_valid_token method
- We also create an endpoint verifyToken which uses **OAuth2PasswordBearer** of graphql which plucks out the token from header. This is a shortcut way, otherwise few lines of code will be needed to take out the JWT token. This endpoint is not used for authentication flow but is used to verify a token through fastapi auto generated documentation
- accessToken is segregated and checked. If no token found or token expired then 401 error is sent to client
- When client sees 401 error it sets isLogin to false and logs out. We could have used refreshToken over here to create the new accessToken at server, but at present it is not required
- Now the login screen automatically displays
- We will use localstorage to store the accesstoken. So if the token is not expired then on hard page refresh(F5) the state of software will be maintained
- It is advisable to keep the life of accessToken as 10 hours

## Data format sample for master details JSON data
{
  tableName: 'name of table'
  xData: [
    {
      col1: 'col1 value'
      col2: 'col2 value'
        ...
    }
  ],
  xDetails: [
    {
      "tableName": "name of details table",
      "fkeyName": "tranHeaderId",
      "xData": [
        {
          col1: 'col1 value'
          col2: 'col2 value'
        ...
        }
      ],
      "deletedIds": [1,2,3...],
      "xDetails": [
          ... further nesting
      ]
    }
  ]
}
## ** Trial balance Sql query** Documentation by AI

Step 1: Recursive Query to Build Account Hierarchy
WITH RECURSIVE hier AS (
    SELECT 
        "accId", 
        "opening", 
        "debit", 
        "credit", 
        "parentId"
    FROM cte1

    UNION ALL

    SELECT 
        a."id" AS "accId", 
        h."opening", 
        h."debit", 
        h."credit", 
        a."parentId"
    FROM hier h
    JOIN "AccM" a ON h."parentId" = a."id"
),
Purpose: The recursive common table expression (CTE) hier generates a hierarchy of accounts starting from the base data in cte1.
Logic:
The initial anchor query retrieves accounts and their balances.
The recursive part adds parent accounts by joining hier with the AccM table.

Step 2: Constants for Branch and Financial Year
"branchId" AS (VALUES (1::int)), 
"finYearId" AS (VALUES (2024)),

Step 3: Base Data Preparation
cte1 AS (
    SELECT 
        d.id, 
        d."accId", 
        0.00 AS "opening",
        CASE WHEN d."dc" = 'D' THEN d."amount" ELSE 0.00 END AS "debit",
        CASE WHEN d."dc" = 'C' THEN d."amount" ELSE 0.00 END AS "credit",
        a."parentId"
    FROM "TranH" h
    JOIN "TranD" d ON h.id = d."tranHeaderId"
    JOIN "AccM" a ON a.id = d."accId"
    WHERE h."finYearId" = (TABLE "finYearId")
      AND h."branchId" = (TABLE "branchId")

    UNION ALL

    SELECT 
        b.id, 
        b."accId",
        CASE WHEN b."dc" = 'D' THEN b."amount" ELSE -b."amount" END AS "opening",
        0.00 AS "debit",
        0.00 AS "credit",
        a."parentId"
    FROM "AccOpBal" b
    JOIN "AccM" a ON a.id = b."accId"
    WHERE b."finYearId" = (TABLE "finYearId")
      AND b."branchId" = (TABLE "branchId")
),

Step 4: Summarize Data at Each Hierarchical Level
cte2 AS (
    SELECT 
        h."accId", 
        a."accName", 
        a."accCode", 
        a."accType", 
        a."accLeaf",
        h."parentId",
        SUM(h."opening") AS "opening", 
        SUM(h."debit") AS "debit",
        SUM(h."credit") AS "credit",
        SUM(h."opening" + h."debit" - h."credit") AS "closing"
    FROM hier h
    JOIN "AccM" a ON a."id" = h."accId"
    GROUP BY 
        h."accId", 
        a."accName", 
        a."accCode", 
        a."accType", 
        a."accLeaf", 
        h."parentId"
),

Step 5: Calculate Profit or Loss
cte3 AS (
    SELECT SUM(opening + debit - credit) AS "profitOrLoss"
    FROM cte1 c
    JOIN "AccM" a ON a."id" = c."accId"
    WHERE "accType" IN ('A', 'L')
),

Step 6: Final Aggregation and JSON Structure
cte4 AS (
    SELECT 
        c."accId" AS id, 
        c."accName", 
        c."accCode",
        c."accType",
        ABS(c."opening") AS "opening", 
        CASE WHEN c."opening" < 0 THEN 'C' ELSE 'D' END AS "opening_dc",
        c."debit", 
        c."credit",
        ABS(c."closing") AS "closing",
        CASE WHEN c."closing" < 0 THEN 'C' ELSE 'D' END AS "closing_dc",
        c."parentId", 
        ARRAY_AGG(child."accId") AS "children"
    FROM cte2 c
    LEFT JOIN cte2 child ON child."parentId" = c."accId"
    GROUP BY 
        c."accId", 
        c."accName", 
        c."accCode", 
        c."opening", 
        c."debit", 
        c."credit", 
        c."closing",
        c."parentId",
        c."accType"
    ORDER BY 
        c."accType", 
        c."accName"
)
SELECT JSON_BUILD_OBJECT(
    'trialBalance', (SELECT JSON_AGG(a) FROM cte4 a),
    'profitOrLoss', (SELECT "profitOrLoss" FROM cte3),
    'balanceSheet', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" IN ('A', 'L')),
    'profitAndLoss', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" IN ('E', 'I'))
) AS "jsonResult";




