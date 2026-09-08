# Deploy log

Entries are written by `/git-deploy`, newest first. Each entry describes one commit;
`Base:` is the commit it was built on, so `git diff <base>..` shows exactly that upload.

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

