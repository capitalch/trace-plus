## Client side side menu
- In SideMenu.tsx find current menuItem from redux selector and get corresponding menu data from master-menu-data.ts
- 

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




