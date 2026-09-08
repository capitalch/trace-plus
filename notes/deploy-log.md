# Deploy log

Entries are written by `/git-deploy`, newest first. Each entry describes one commit;
`Base:` is the commit it was built on, so `git diff <base>..` shows exactly that upload.

## 2026-09-08 20:01 (main)
Masters: enforce Audit Lock Date across transactions

- validators-hook: checkAllowedDate now rejects a transaction date on or before the audit lock date, after the existing financial-year range check. All nine transaction entry forms already register this validator on tranDate, so vouchers, purchases, purchase returns, sales, sales returns, debit and credit notes, stock journal and branch transfer are covered with no per-module edits
- Syncfusion grid control: the shared row-action handler now refuses edit and delete on a transaction dated inside the closed period. Preview, zoom-in and copy are deliberately untouched, and rows carrying no tranDate (master grids) are never locked
- utils-info-hook: useUtilsInfo exposes auditLockDate from general settings, alongside the existing defaultGstRate and maxGstRate
- messages: added errDateOnOrBeforeAuditLock for the form validator and messAuditLocked for the grid refusal dialog
- Scope: enforcement is client-side only. The Audit Lock Date was previously stored but read by nothing; a matching check in generic_update_helper is still needed to make the lock authoritative

Files: 4 changed (+40 / -3) — Base: 3a850f64

## 2026-09-08 19:36 (main)
Sales: show line-item remarks in invoice PDF items column

- all-sales-invoice-jspdf.tsx: line-item remarks are now concatenated into the Items column, after the product name and before HSN and serial numbers; rows with no remarks render exactly as before
- all-sales-return-invoice-jspdf.tsx: same addition, keeping the sales return invoice consistent with the sales invoice
- Dropped the stale all-sales-invoice-jspdf.tsx.backup copy of the generator
- Removed the sales folder claude.md instructions file
- all-sales-view.tsx: BACK button icon uses the current Tailwind shrink-0 utility instead of flex-shrink-0

Files: 5 changed (+3 / -527) — Base: 66d3b6ca

## 2026-09-08 15:15 (main)
git-deploy: make the skill repo-agnostic and soften the secret guard
- collect-changes.sh: block only new secret-shaped files; an already-tracked one now warns via SECRET_TRACKED instead of aborting every deploy
- collect-changes.sh, finish-deploy.sh: guard on the skill's own location rather than a hardcoded repo name, so it refuses to run against a different repo
- finish-deploy.sh: derive the commit URL from the origin remote
- collect-changes.sh: report REPO= in the header block
- SKILL.md: document the SECRET_TRACKED outcome and how to describe unread files
Files: 3 changed (+35 / -21) — Base: 71b3f500

## 2026-09-08 15:06 (main)
General ledger: refresh from live store; fix picker and parent edit

- General ledger: loadData now reads account, fin year, branch and BU fresh
  from the redux store instead of the mount-time render closure, so the
  toolbar Refresh button no longer re-queries with stale parameters
- General ledger: extracted the duplicated reset logic into clearLedger(),
  used both by the no-account effect and by loadData
- CompReactSelect: bail out while options are still empty, and only
  setValue/clearValue on a real change, so it stops firing spurious onChange
  and clearing a valid selection before the option list loads
- Accounts edit modal: type selectedParent as ParentOptionsType and fall back
  to the existing parentId when the parent was not changed, fixing saves that
  dropped the parent
- Chore: add the /git-deploy skill and notes/deploy-log.md; git-deploy.sh is
  now labelled as the manual fallback
- Docs: add the migration-tool, schema-hardening and payment-account plans;
  drop the superseded plans/tran.md

Files: 6 changed (+45 / -48) — Base: a8ef4ea6

