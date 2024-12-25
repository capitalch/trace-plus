export const SqlIdsMap = {
  //Security
  allAdminRoles: "get_all_admin_roles_onClientId",
  allAdminUsers: "get_all_admin_users",
  allBusinessUsers: "get_all_business_users_on_clientId",
  allBusinessUnits: "get_all_business_units_on_clientId",
  adminDashBoard: "get_admin_dashboard",
  allClients: "get_all_clients",
  allRoles: "get_all_roles",
  allSecuredControls: "get_all_secured_controls",
  getAdminRoleOnRoleNameClientId: "get_admin_role_on_roleName_clientId",
  getAdminRolesSecuredControlsLink: "get_admin_roles_securedControls_link",
  getAllClientNamesNoArgs: "get_all_client_names_no_args",
  getAllRoleNamesOnClientIdWithBuiltinRoles:
    "get_all_role_names_on_clientId_with_builtin_roles",
  getBuiltinRoles: "get_builtin_roles",
  getBuOnBuCodeAndClientId: "get_bu_on_buCode_and_clientId",
  getBuUsersLink: "get_bu_users_link",
  getClientOnClientCode: "get_client_on_clientCode",
  getClientOnClientName: "get_client_on_clientName",
  getRolesSecuredControlsLink: "get_roles_securedControls_link",
  getSecuredControlsNotLinkedWithRoleId:
    "get_securedControls_not_linked_with_roleId",
  getSuperAdminRoleOnRoleName: "get_super_admin_role_on_role_name",
  getSuperAdminControlOnControlName: "get_super_admin_control_on_control_name",
  getUserIdOnClientIdEmail: "get_userId_on_clientId_and_email",
  getUserIdOnClientIdUid: "get_userId_on_clientId_and_uid",
  getUsersNotLinkedWithBuIdExcludeAdmin:
    "get_users_not_linked_with_buId_exclude_admin",
  insertSecuredControlsFromBuiltinRole:
    "insert_securedControls_from_builtin_role",
  superAdminDashBoard: "get_super_admin_dashboard",
  testConnection: "test_connection",

  // accounts
  getAccountBalance: "get_account_balance",
  getAccountLedger: "get_account_ledger",
  getAllBanks: "get_all_banks",
  getBankRecon: "get_bank_recon",
  getLedgerLeafAccounts: "get_ledger_leaf_accounts",
  getSettingsFinYearsBranches: "get_settings_fin_years_branches",
  getSubledgerAccounts: "get_subledger_accounts",
  getTrialBalance: "get_trial_balance",
};
