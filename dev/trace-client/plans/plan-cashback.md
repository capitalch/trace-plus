# plan1 — `cashback` accounts in Sales → Payment Details → Payment Methods (rows index > 0)

**Goal:** every leaf and subledger account whose class is `cashback` must appear in the
"Payment Account" dropdown for payment rows with `index !== 0`, in every sales type.
**Row 0 is out of scope** and stays exactly as it is today, under all three radios.

Note on scope: there is **no special "Cashback" group**. The user may create *any number* of groups
with *any names*; the only thing that matters is that their class is `cashback`. The dropdown filter
is on `accClass`, never on group membership, so all of them merge into one option list. Everything
below is written for the general case.

---

## 1. Background: how accounts are modelled

You need three columns of `AccM` to follow the rest of this document. They are easy to confuse
because all three sound like "what kind of account is this", but they answer different questions.

```sql
CREATE TABLE public."AccM" (          -- accounts.sql:305-315
    id integer NOT NULL,
    "accCode" text NOT NULL,
    "accName" text NOT NULL,
    "accType" character(1) NOT NULL,  -- A / L / E / I
    "parentId" integer,               -- self-referencing tree
    "accLeaf" character(1) ...,       -- N / L / Y / S
    "isPrimary" boolean ...,
    "classId" smallint NOT NULL       -- -> AccClassM.id
);
```

### `accType` — where the account lands in the financial statements

`A`sset, `L`iability, `E`xpense, `I`ncome. **This is the only one of the three that the financial
statements read.** `get_balanceSheet_profitLoss` (`sql_accounts.py:1352+`) and the trial balance
aggregate by `accType` and never look at `accClass`. Get this wrong and a cashback balance silently
appears in the P&L instead of the Balance Sheet, with nothing in the app flagging it.

### `accClass` — a behaviour tag used to filter pickers

Lives in the tiny lookup table `AccClassM` (16 rows today: `bank`, `cash`, `card`, `ecash`, `debtor`,
`creditor`, `sale`, `purchase`, …, `accounts.sql:1420-1435`). It carries **no accounting meaning** —
its entire job is to answer "which accounts should this particular dropdown offer?". That is exactly
why adding a new class is cheap: nothing downstream computes anything from it.

One important detail: `AccClassM.id` is a plain `smallint` with **no sequence** — ids 1..16 are
hardcoded in the seed script and again in the client. So `id = 17` for `cashback` is a constant we
choose, not something the database generates.

### `accLeaf` — the account's position in the tree

This is the one that decides how a row renders in the dropdown:

| Value | Meaning | Can hold transactions? | In the dropdown |
|---|---|---|---|
| `N` | **Group** — a folder, e.g. "Current Assets" | no | not listed at all |
| `Y` | **Leaf** — a plain postable account | yes | listed, selectable |
| `L` | **Ledger** — a parent that owns subledgers | no (its children do) | listed but **greyed** as a header |
| `S` | **Subledger** — a child of a ledger | yes | listed, selectable, marked 🔹 |

The modal enforces the shape (`accounts-add-child-modal.tsx:222-232`): under a Group you may add a
Group, a Leaf, or a Ledger; under a Ledger the **only** option is Subledger.

### Class and type are inherited, never set per account

This is the part that makes the whole plan cheap, so it is worth being explicit:

- **On create:** `accounts-add-child-modal.tsx:126-134` builds the new row with
  `accType: accType, classId: classId` copied straight from the parent it was launched from.
- **On re-parent:** `update_accounts_master` (`sql_accounts.py:4070-4086`) walks the subtree
  recursively and re-stamps `classId` *and* `accType` from the new parent onto every descendant.

So once **any** group is created as `accType 'A'` / `classId 17`, every leaf, ledger and subledger
added beneath it is automatically Asset + cashback. There is no per-account class field anywhere in
the UI, and no way for a child to drift out of its parent's class.

### Corollary: how a group can end up with class `cashback`

Because class is always inherited, there are exactly **two** ways, and it is worth knowing both:

1. **Top-level, via Add Group** (`accounts-add-group-modal.tsx`). This is the only screen in the app
   where a class is *chosen* rather than inherited. It posts no `parentId`, so the group is created
   at the root of the tree. Repeat it as many times as you like — several independent cashback
   groups, with whatever names suit the business.
2. **As a sub-group beneath an existing cashback group**, via Add Child at level *Group*. It inherits
   `classId` from its parent, so it is cashback automatically.

What is **not** possible: making a sub-group under a non-cashback parent (say, under Bank) into a
cashback group. It would inherit `bank`. And nothing in the UI can change an account's class after
creation — `accounts-edit-modal.tsx` edits only code, name and parent, and `update_accounts_master`
re-derives `classId` solely from the new parent. So the class of a subtree is fixed at the moment its
root group is created.

---

## 2. Background: how the dropdown gets its options

The "Payment Account" control is `AccountPickerFlat`. It does not receive a list of accounts — it
fetches its own, and the caller only tells it *what to fetch*, via two props:

```tsx
// payment-details.tsx:354-371
<AccountPickerFlat
    accClassNames={getAccClassNames(salesType, index)}   // WHICH classes
    sqlId={getSqlId(index)}                              // WHICH query
    ... />
```

The full round trip for one dropdown:

```
payment-details.tsx  getAccClassNames() -> ['cash','bank','card','ecash']
                     getSqlId()         -> null
        |
account-picker-flat.tsx  loadLocalData()                                    (:178-195)
        |   sqlId   = sqlId || SqlIdsMap.getLeafSubledgerAccountsOnClass     <- the fallback
        |   sqlArgs = { accClassNames: accClassNames.join(',') }             <- "cash,bank,card,ecash"
        |
utils.tsx  doGenericQuery()  ->  GraphQL  genericQuery(dbName, {buCode, sqlId, sqlArgs})   (:169-186)
        |
graphql_helper.py  generic_query_helper()                                    (:257-277)
        |   sql = getattr(SqlAccounts, sqlId)      <- sqlId IS the attribute name on the class
        |
psycopg_async_helper.py  SET search_path TO <buCode>;  then execute(sql, sqlArgs)
        |
        v
rows -> setOptions(res) -> react-select renders them
```

Two consequences of this design matter here:

1. **`sqlId` is just an attribute name** on the `SqlAccounts` class (`sql_accounts.py`). There is no
   registry or dispatch table — `getattr` looks it up by string.
2. **The fallback query is class-driven and generic.** When `getSqlId` returns `null`, the picker uses
   `get_leaf_subledger_accounts_on_class`:

```sql
-- sql_accounts.py:2308
with "accClassNames" as (values (%(accClassNames)s::text))
SELECT a.id, a."accName",
       CASE WHEN a."accLeaf" = 'S' THEN true ELSE false END AS "isSubledger",
       a."accLeaf",
       p."accName" AS "accParent",
       CASE WHEN a."accLeaf" = 'L' THEN true ELSE false END AS "isDisabled"
FROM "AccM" a
JOIN "AccM" p       ON p.id = a."parentId"
JOIN "AccClassM" c  ON c.id = a."classId"
WHERE a."accLeaf" IN ('S', 'L', 'Y')                       -- groups (N) excluded here
  AND ( (table "accClassNames") IS NULL
        OR c."accClass" = ANY(string_to_array((table "accClassNames"), ',')) )
ORDER BY ...
```

Read that `WHERE` clause carefully — **it hardcodes no class names**. It takes whatever comma-joined
list the client sends. That single fact is why this whole feature needs no server-side SQL change:
a new class flows through an existing, already-generic query.

The `isSubledger` / `isDisabled` flags it returns are what `CustomOption`
(`account-picker-flat.tsx:198-271`) uses to draw the 🔹 marker and grey out ledger headers.

### Which rows use which query

`getSqlId` (`payment-details.tsx:186-202`) only overrides the fallback in two situations:

| Sales type | Row 0 | Rows > 0 |
|---|---|---|
| Retail | fallback (`get_leaf_subledger_accounts_on_class`) | **fallback** |
| Auto Subledger (Bill Sale) | `getAutoSubledgerAccounts…` (auto-subledger ledgers only) | **fallback** |
| Institution | `getLeafAccountsOnClassWithoutAutoSubledgers` | that same query |

And `getAccClassNames` (`:170-184`) short-circuits on the index **before** it even looks at the radio:

```ts
const getAccClassNames = (salesType: SalesType, index: number): AccClassName[] => {
    if (index !== 0) {
        return ['cash', 'bank', 'card', 'ecash'];   // <-- every row > 0, whatever the radio
    }
    switch (salesType) { ... }                      // row 0 only
};
```

So **rows > 0 are governed by one line of code** (`:172`), identical in all three sales types, while
row 0 is governed by the `case` arm for its radio and is left untouched. That single early return is
the entire surface area of this change — nothing else in the picker, the query layer or the server
participates.

---

## 3. Verdict: does the suggested implementation achieve the goal?

**Yes.** Every bullet in `prompt1.md` holds up against the code:

| prompt1 bullet | Verified |
|---|---|
| New class row `'cashback'`, id 17 | ✅ ids are hand-assigned, 1-16 taken, `UNIQUE ("accClass")` at `accounts.sql:2070`. 17 is free. ⚠ The table is named **`AccClassM`**, not `AccClassMaster`. |
| Group of `accType 'A'`, class cashback, via the existing Add Group UI | ✅ the modal posts `accLeaf: 'N'`, `isPrimary: false` and **no** `parentId`, i.e. a new top-level group. Any name, and any number of such groups. Needs M3 (below) before `cashback` can be chosen. |
| Leaves, or ledgers with subledgers, beneath it | ✅ allowed by `accounts-add-child-modal.tsx:222-232`, and class/type inherit automatically (§1). |
| Those leaves + subledgers appear for rows > 0 | ✅ after the one-line change in Step 7. |

### Worked example

Nothing requires a single group. Say the business creates **two** unrelated groups, each with
Type `Asset` and Class `cashback` (everything below them inherits both):

```
Wallet Receivables              N   group   (id 61)  <- classId 17, accType A
├── Paytm Cashback              Y   leaf
└── UPI Cashback Ledger         L   ledger  (id 64)
    ├── PhonePe Cashback        S   subledger
    └── GPay Cashback           S   subledger

Card Issuer Cashback            N   group   (id 70)  <- classId 17, accType A
├── HDFC Card Cashback          Y   leaf
└── ICICI Card Cashback         Y   leaf
```

After Step 7, the Payment Account dropdown on **row 2** contains all of it, merged into the existing
list — because the query filters on `accClass = 'cashback'`, not on which group an account sits in:

```
  … existing cash / bank / card / ecash accounts …
  Paytm Cashback                 <- selectable    (Y, parent 61)
  UPI Cashback Ledger            <- GREYED header (L, isDisabled = true)
  🔹 PhonePe Cashback            <- selectable    (S, parent 64)
  🔹 GPay Cashback               <- selectable    (S, parent 64)
  HDFC Card Cashback             <- selectable    (Y, parent 70)
  ICICI Card Cashback            <- selectable    (Y, parent 70)
```

Neither group row appears, because `accLeaf = 'N'` fails the query's `accLeaf IN ('S','L','Y')`
filter. That is correct — a group is a folder and cannot hold a posting.

**On ordering with several groups.** The list is *not* alphabetical overall. The query's `ORDER BY`
is `CASE WHEN accLeaf='L' THEN a.id ELSE a."parentId" END`, then ledger-before-children, then name.
In plain terms: rows **cluster by parent**, a ledger sits immediately above its own subledgers, and
the clusters themselves come out in parent-**id** order — i.e. roughly the order the parents were
created, not alphabetical. So a group added later appears lower down, and its accounts stay together.
Each option also renders its parent's name as a subtitle (`CustomOption`,
`account-picker-flat.tsx:252-268`), so the operator can see which group an account belongs to.

**On duplicate names across groups:** not possible. `does_acc_name_exist` and `does_acc_code_exist`
(`sql_accounts.py:6-22`) check the **whole schema**, case-insensitively, when an account is created,
so two cashback groups cannot both contain a "Paytm Cashback". (The database itself only enforces
`UNIQUE ("accCode", "parentId")` — `accounts.sql:1742-1743` — so this uniqueness is an app-layer
rule, not a schema guarantee.)

**Row 0 is unchanged** in all three sales types, which is what the goal asks for — its class list
comes from the `switch` arms, none of which is touched.

### Why nothing else breaks

- **Saving:** `all-sales-submit-hook.ts:66-77` writes only `accId`, `dc`, `amount`, `instrNo`,
  `lineRefNo`, `remarks` into `TranD`. No class is stored or validated on save, client or server.
- **A cashback row does not disturb the radio on reopen.** The derivation scans **every** debit row,
  not just row 0: any row with `isParentAutoSubledger` → Bill; else any row with `accClass`
  debtor/creditor → Institution; else Retail. Cashback matches neither test, so a cashback account in
  row 2 leaves the radio wherever it was. The one thing that could break this is a cashback *ledger*
  being flagged `isAutoSubledger`, which would make a sale using its subledgers reopen as Bill Sale;
  that cannot happen, because the auto-subledger switch is rendered only for
  `accLeaf === 'L' && accClass === 'debtor'` (`accounts-master.tsx:298`).
- **Reopening a saved sale:** `payment-details.tsx:62-71` re-derives the radio from the loaded rows —
  `isParentAutoSubledger` → Bill, else `accClass IN ('debtor','creditor')` → Institution. `'cashback'`
  matches neither, so the radio correctly stays where it was.
- **A subtle one worth knowing:** the class-list change is *also* what makes a saved cashback row
  display. The picker resolves its selected value with
  `options.find(opt => opt.id === value)` (`account-picker-flat.tsx:133`). If `cashback` were not in
  the class list, the account would not be in `options`, and the saved row would reopen **blank** —
  not merely unselectable, but looking empty to the user.
- **Financial statements:** unaffected, because they key off `accType` (§1), and every cashback
  group is `A`.

---

## 4. What the prompt omits — and what happens if you skip it

The prompt describes the *data* work but not the *code* work. Three changes are load-bearing:

### M1 — `AccClassName` union type (`account-picker-flat.tsx:298-314`)

`accClassNames` is typed as a union of string literals, not `string[]`:

```ts
export type AccClassName = null | 'capital' | 'loan' | 'other' | ... | 'ecash'
```

Writing `['cash','bank','card','ecash','cashback']` in `getAccClassNames` is therefore a **compile
error** until `'cashback'` joins the union. Nothing runs until this is fixed.

### M2 — the class row must reach every database

The prompt says "a new row is added in table AccClassM". Two places need it, for two different
populations:

- `app/graphql/scripts/accounts.sql` is the **template** executed by `create_bu.py:109` when a new
  business unit is created — this covers all *future* BUs.
- Every *existing* tenant schema needs the row inserted by hand. There is no Alembic and no
  migration runner in this project; `app/db_update/sql_patch6.sql` is a hand-run changelog file that
  no code ever executes.

Skip the first and new customers silently lack the feature. Skip the second and existing customers
cannot create a cashback group at all.

### M3 — the `classMappings` map (`accounts-add-group-modal.tsx:246-289`)

This is the least obvious one. The Add Group modal does **not** read `AccClassM` from the database.
It has its own hardcoded copy, keyed by account type:

```ts
const classMappings = {
    A: [ { id: "", accClass: "--- select ---" }, { id: 13, accClass: "bank" },
         { id: 1, accClass: "branch" }, { id: 15, accClass: "card" }, { id: 14, accClass: "cash" }, ... ],
    E: [ ... ], I: [ ... ], L: [ ... ],
}
```

and the Account Class dropdown is built from `classMappings[accountType]`. So inserting the row in
the database is **not enough** — without an entry here, `cashback` never appears as an option, and
the prompt's second bullet ("user adds a group whose class is cashback") is simply impossible to
perform. The class id lives in two hand-maintained places and nothing keeps them in sync.

---

## 5. Keeping `accType = 'A'` (prompt bullet 2)

The prompt requires the group to be Asset. Per §1 that is the consequential choice — it decides
Balance Sheet vs. P&L.

Note the direction of the existing UI: the operator picks **Account Type first**, and the class list
is derived from it. So the rule is not "force the type once cashback is picked"; it is the equivalent
and much simpler contrapositive: **only ever offer `cashback` under Asset.**

**Decision: enforcement is front-end only (L1 + L2).** A database `CHECK` constraint was considered
and **dropped** — the residual gap it would have covered is described below.

| Layer | Where | Cost | What it stops |
|---|---|---|---|
| **L1** structural | `cashback` in `classMappings.A` **only** (Step 5) | zero — it is the same edit M3 already requires | the class ever being offered for E / I / L |
| **L2** client guard | reset `accountClass` when `accountType` changes (Step 6) | ~4 lines | a stale class value surviving a type switch |

**What L1 + L2 cover:** together they close the Add Group screen completely — L1 means `cashback` is
never offered outside Asset, and L2 removes the one sequence that could smuggle a stale `classId` past
it (Step 6). That is the whole of the realistic path, since Add Group is the only screen where a class
is chosen at all (§1 corollary), and every child inherits from there.

**The residual gap, accepted:** `generic_update_helper` (`graphql_helper.py:284-300`) is a
schema-agnostic table writer — it unpacks whatever `xData` the client sends and writes it to whatever
`tableName` it is given, with no per-table validation anywhere in the server, and there is no FK or
`CHECK` on `AccM` covering class/type. So a hand-crafted GraphQL call or direct SQL could still create
a `classId = 17` account with a non-Asset type. Nothing in the app would flag it; the symptom would be
a cashback balance appearing in the P&L rather than the Balance Sheet. This is a deliberate trade-off
against maintaining a hardcoded `17` in a constraint across every tenant schema — the same class of
risk the app already carries for every other class, none of which is constrained either.

**Also not covered:** re-parenting. `update_accounts_master` deliberately re-stamps `classId` *and*
`accType` from the new parent (§1), so moving a cashback account — or a whole cashback group — under a
Liability group leaves the rows internally consistent; they just **stop being cashback accounts** and
quietly disappear from the dropdown. Nothing guards against this and nothing warns when it happens —
it is left to operator discipline, as it already is for every other class.

---

## 6. Implementation steps

### Step 1 — Fix the constants
- Table is **`AccClassM`** (`accounts.sql:293-297`). Use **`id = 17`, `accClass = 'cashback'`** as the
  prompt specifies; 17 is free and `UNIQUE ("accClass")` is satisfied.
- `accType` for every cashback group = **`A`**, per the prompt; enforced as in §5.
- There is **no foreign key** from `AccM.classId` to `AccClassM`, so the database will not stop you
  from writing a dangling `classId` — but the picker joins on it, so the row must exist or the
  accounts simply never appear. (This is also why the Asset rule has no database backstop; see §5.)

### Step 2 — `accounts.sql`: add the class (M2, future BUs)
After line 1435 (`... VALUES (16, 'ecash');`):
```sql
INSERT INTO public."AccClassM" VALUES (17, 'cashback');
```

### Step 3 — Patch existing tenants: `app/db_update/sql_patch7.sql` (new, M2)
```sql
-- Created on 2026-09-08
-- Requirement: new account class 'cashback' for Sales payment methods
-- to be added accounts.sql
INSERT INTO "AccClassM" ("id", "accClass") VALUES (17, 'cashback')
    ON CONFLICT ("id") DO NOTHING;
```
⚠ **This file is documentation, not automation.** Nothing in the server executes `db_update/*.sql`;
`sql_patch6.sql` is a hand-run changelog and this follows its convention. Run the statement once per
`buCode` schema, with `SET search_path TO <buCode>;` first.

### Step 4 — `account-picker-flat.tsx` (M1)
Add `| 'cashback'` to the `AccClassName` union (lines 298-314). Nothing else in this control changes:
`loadLocalData()` joins whatever list it is given and forwards it verbatim.

### Step 5 — `accounts-add-group-modal.tsx`: offer the class (M3 + §5 L1)
Add `{ "id": 17, "accClass": "cashback" }` to the **`A` array only**, after `cash` to keep the
existing alphabetical order. Do **not** add it to the `E` / `I` / `L` arrays — that omission is what
makes the Asset requirement structural rather than a matter of operator discipline.

### Step 6 — `accounts-add-group-modal.tsx`: reset the class on type change (§5 L2)
`accountClass` is an **uncontrolled** react-hook-form field (`{...register('accountClass', ...)}`),
and `accountType` is only read with `watch()` to rebuild the `<option>` list. Nothing links them. So:

1. pick Type `Asset` → the class list rebuilds,
2. pick Class `cashback` → RHF stores `17` on the change event,
3. switch Type to `Expense` → the `<option>` list is replaced and the browser resets the visible
   selection, **but no change event fires**, so RHF still holds `17`.

Submitting now writes `classId = 17` with `accType = 'E'` while the user is looking at
`--- select ---`. The `required` rule does not catch it, because the stored value is not empty. Fix
by resetting the dependent field whenever the parent changes — take `resetField` from `useForm()`:

```tsx
useEffect(() => {
    resetField('accountClass', { defaultValue: '' })
}, [accountType, resetField])
```

This is a pre-existing defect affecting every class, not something this feature introduces — but it
is the hole through which the Asset rule could be bypassed.

### Step 7 — `payment-details.tsx`: the goal itself
One line in `getAccClassNames` — the `index !== 0` early return (line 172):

```ts
const getAccClassNames = (salesType: SalesType, index: number): AccClassName[] => {
    if (index !== 0) {
        return ['cash', 'bank', 'card', 'ecash', 'cashback'];   // line 172 — every row > 0
    }
    switch (salesType) {                                        // row 0 — all arms unchanged
        case 'retail':      return ['cash', 'bank', 'card', 'ecash'];
        case 'bill':        return [null];
        case 'institution': return ['debtor', 'creditor'];
        default:            return ['cash', 'bank', 'card', 'ecash'];
    }
};
```

Leave the whole `switch` alone. Because the early return fires before the radio is even consulted,
this one line covers rows > 0 in all three sales types, and row 0 keeps its current behaviour in each.

### Step 8 — `use-voucher-accounts-cache.ts`: Journal voucher
Add `'cashback'` to the **`journalAccounts`** array (line 18):
```ts
journalAccounts: ['branch', 'capital', 'other', 'loan', 'iexp', 'dexp', 'dincome',
                  'iincome', 'creditor', 'debtor', 'sale', 'purchase', 'cashback'],
```

**Why this is a separate step rather than covered by Step 7:** vouchers do not let the picker fetch
its own options. `useVoucherAccountsCache` pre-loads four fixed lists at startup — one generic
`getLeafSubledgerAccountsOnClass` call per list, each with its own hardcoded class array
(`:14-19`) — and `journal-voucher.tsx:13,28` hands the result in as `accountOptions`. When
`accountOptions` is supplied, `AccountPickerFlat` uses it directly and **skips its own query
entirely** (`account-picker-flat.tsx:50-56`), so `accClassNames` and `sqlId` are ignored on that
screen. The class list at `:18` is therefore the only thing that decides what a Journal voucher
offers.

Nothing else changes: the query behind the cache is the same class-driven
`getLeafSubledgerAccountsOnClass`, so cashback leaves and subledgers come back with the same
selectable/greyed/🔹 treatment as everywhere else, and the entry is picked up on the next
`loadAllAccountsCache()` (or `refreshCacheKey('journalAccounts')` via the picker's refresh button).

⚠ Worth being aware of, not a blocker: the other three buckets stay as they are, so a cashback
account will **not** appear in Payment, Receipt or Contra vouchers. Note the `journalAccounts` list
deliberately excludes `cash`/`bank`/`card`/`ecash` — those movements are meant to go through
Payment / Receipt / Contra. Adding cashback to Journal therefore treats it as an ordinary
receivable rather than a money-like instrument. If cashback balances also need to be *settled*
(i.e. received into a bank), `receiptCreditAccounts` at `:17` is the list that would need it too.

### Step 9 — Master data, per business unit (UI only, no code)
1. Accounts master → **Add Group** → Account Type `Asset` (after Step 5, the only type that offers
   `cashback`), Account Class `cashback`, plus code and name. The name is free — call it whatever the
   business calls it. Creates a top-level group, `accLeaf = 'N'`.
   **Repeat for as many cashback groups as are wanted**; they are independent and all feed the same
   dropdown. Note this Add Group screen is the *only* place a class can be chosen (§1 corollary), so
   every cashback group has to start here, at the root — a cashback group cannot be nested under a
   bank or cash group.
2. On each such group row → **Add Child** → level **Leaf** for simple accounts, or level **Ledger**
   for ones that need subledgers.
3. On each Ledger row → **Add Child** → level **Subledger** (the only level offered there).
4. Nothing to set per account — `classId` and `accType` inherit at every level (§1).

### Step 10 — Testing
1. `npm run build` — proves Step 4; it fails loudly if the union was missed.
2. New BU: confirm `AccClassM` has row 17 (Step 2).
3. Existing BU: `cashback` appears in the Add Group class dropdown (Steps 3, 5).
4. Build the two-group tree from §3, then Sales → Payment Details → **Add** (row 2). Expect exactly
   the worked-example list: leaves and subledgers from **both** groups present and selectable, the
   ledger greyed, neither group row shown, and accounts clustered by parent rather than sorted
   alphabetically across the whole list.
5. Rows > 0: repeat on Retail, Auto Subledger (Bill Sale) and Institution — cashback must appear in
   all three.
6. **Row 0 must be unchanged** under all three radios: Retail still cash/bank/card/ecash only,
   Bill Sale still auto-subledger ledgers only, Institution still debtor/creditor only. No cashback
   account may appear in row 0 in any of them.
7. Save a sale with a cashback account in row 2, then reopen it: the account name must still render
   (this is the `options.find` trap from §3) and the Sales Type radio must not have flipped.
8. Journal voucher: open a new Journal, and confirm cashback leaves/subledgers appear in both the
   debit and credit account pickers (`journal-voucher.tsx:13,28`). If they do not, the cached list is
   stale — hit the picker's refresh button or reload, since the cache loads once at startup.
   Confirm they are still **absent** from Payment, Receipt and Contra vouchers.
9. Trial Balance and Balance Sheet: the cashback balance sits under Assets and the totals tie.
10. Add Group with Type `Expense`, `Income`, `Liability`: `cashback` must not be listed (L1).
11. Add Group: `Asset` → `cashback` → switch Type to `Expense` → save. Must block on `required` (L2).
Note there is no test for a mismatched write made outside the UI — with L3 dropped, nothing rejects
one; see §5.

---

## 7. Risks

1. **Manual multi-tenant rollout** (Step 3) is the biggest operational risk. A missed schema fails
   silently — no error until a user tries to create a cashback group — and there is no version table to
   detect which schemas have been patched.
2. **`accType` is the real accounting decision;** `accClass` only filters pickers (§1).
3. **`get_leaf_subledger_accounts_on_class` has no `NOT "isHidden"` filter** (`sql_accounts.py:2308`),
   unlike two of its sibling queries. Hidden cashback accounts remain selectable. Pre-existing
   behaviour, not introduced here.
4. **Cosmetic report side-effect:** `sql_accounts.py:2740` derives the sales-report "party" column
   from a fixed class list, so a cashback-only payment will show a blank party. Note that subquery is
   a bare `SELECT DISTINCT` — adding a class to it raises the chance of a "more than one row
   returned" error on multi-payment invoices, so test before changing it.
5. **Class ids are duplicated** between the DB seed and the client `classMappings`, with nothing
   deriving one from the other — they must be kept in sync by hand.
6. **Re-parenting silently re-classes a subtree.** `update_accounts_master`
   (`sql_accounts.py:4070-4086`) overwrites `classId` and `accType` from the new parent, and
   `get_account_parent_options` (`:332-363`) offers any `A` *or* `L` parent to an Asset account. So a
   cashback account — or an entire cashback group — can be moved under a Liability group and quietly
   leave the dropdown. Unguarded by decision; the groups are ordinary editable accounts.
7. **`isDisabled` on ledger rows is presentation-only.** `CustomOption` blocks the click
   (`account-picker-flat.tsx:221-228`), but react-select's own `isOptionDisabled` is not wired up, so
   keyboard selection of a greyed ledger header may still be possible. Pre-existing; check in
   Step 10.4.
8. **The Asset rule has no backstop below the UI** (§5). Accepted trade-off; the exposure is a
   cashback balance landing in the P&L if an account is ever created outside the Add Group screen.

---

## 8. Files to change

| # | File | Change | Why |
|---|---|---|---|
| 1 | `trace-server/app/graphql/scripts/accounts.sql` | `INSERT INTO "AccClassM" VALUES (17, 'cashback');` | the class exists for future BUs (M2) |
| 2 | `trace-server/app/db_update/sql_patch7.sql` *(new)* | the same INSERT | existing tenants; run manually per schema (M2) |
| 3 | `account-picker-flat.tsx` | `| 'cashback'` in `AccClassName` | otherwise the build fails (M1) |
| 4 | `accounts-add-group-modal.tsx` | `{ id: 17, accClass: "cashback" }` in `classMappings.A` **only** | class becomes selectable (M3) + Asset-only (L1) |
| 5 | `accounts-add-group-modal.tsx` | reset `accountClass` when `accountType` changes | closes the stale-value bypass (L2) |
| 6 | `payment-details.tsx` | `'cashback'` in the `index !== 0` array (line 172) only | **the goal** |
| 7 | `use-voucher-accounts-cache.ts` | `'cashback'` in `journalAccounts` (line 18) | cashback usable in Journal vouchers |

**No change needed:** `sql-ids-map.ts`, any query in `sql_accounts.py`, `all-sales-submit-hook.ts`,
`accounts-add-child-modal.tsx`, `accounts-edit-modal.tsx` — class inheritance and the generic
class-driven query already handle a new class without modification.
