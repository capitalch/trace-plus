const Messages = {
  errAccCodeExists: 'Account code altready exists',
  errAccNameExists: 'Account name altready exists',
  errAdminRoleNameExists: 'The admin role for current client already exists',
  errAtLeast4Chars: 'Should be at least 4 chars long',
  errAtLeast8Chars: 'Should be at least 8 chars long',
  errAtLeast6Chars: 'Should be at least 6 chars long',
  errAtMost10Chars: 'Should be at most 10 chars long',
  errAtMost30Chars: 'Should be at most 30 chars long',
  errAtMost50Chars: 'Should be at most 50 chars long',
  errAtMost150Chars: 'Should be at most 150 chars long',
  errBuCodeExists:
    'This business unit code already exists for the current client',
  errCannotBeZero: 'Cannot have zero values',
  errCatNameExists: 'Category name altready exists',
  errCatBrandLabelExists:
    'This category, brand and product label already exists',
  errCgstValidationError: 'Cgst validation error',
  errClientCodeExists: 'Client code altready exists',
  errClientNameExists: 'Client name already exists',
  errCurrentAndNewUidCannotBeSame: 'Current uid and new uid cannot be same',
  errCurrentAndNewPwdCannotBeSame: 'Current and new passwords cannot be same',
  errCurrentFinYear: 'There was some error in current financial year',
  errDebitCreditMismatch: 'Total debits do not match total credits or value is 0',
  errDeletingRecord: 'Could not delete the record',
  errEmailExistsForClient: 'This email already exists for the current client',
  errExtDbParamsFormatError:
    'External database parameters are not in proper format',
  errExistingAccountHasChildren:
    'The existing account has children. You cannot change parent account to ledger type',
  errFailFetchingDataFromAccounts:
    'Failed in fetching data from accounts database. Hence logging out',
  errForbiddenChar: 'Forbidden char is present. Allowed .@$#+:(),_-*&',
  errForbiddenChar1: 'Forbidden char is present. Allowed ()_-+*',
  errGstRateTooHigh: 'Gst rate is too high',
  errGstRateTooLow: 'Gst rate is too low',
  errHsnTooHigh: 'HSN code is too high',
  errIgstValidationError: 'Igst validation error',
  errIncrementedFinYearNotExists:
    'Incremented financial year does not exist. Please create a new financial year in the accounts',
  errInputMustBeUrl: 'Input must be a valid URL',
  errInvalidAddress: 'Invalid address format',
  errInvalidClientName: 'Invalid client name',
  errInvalidDate: 'Invalid date',
  errInvalidEmail: 'Invalid email',
  errInvalidGstin: 'Invalid GSTIN no',
  errInvalidGstStateCode: 'Invalid state code',
  errInvalidHsn: 'Invalid HSN',
  errInvalidIpAddress: 'Invalid IP address',
  errInvalidLandPhone: 'Invalid land phone',
  errInvalidMobileNo: 'Invalid mobile no',
  errInvalidPinCode: 'Invalid pin code',
  errInvalidUserNameOrEmail: 'Invalid user name or email address',
  errInvoiceExists: 'Invoice already exists',
  errLastPurDateLessThanStartDate: 'Last purchase date should be less than',
  errMustBePositive: 'Must be a positive number',
  errMustHaveOneDigit: 'Should have a digit',
  errMustHaveOneLetter: 'Should have one letter',
  errMustHaveOneSpecialChar: 'Must have a special character',
  errNoSpceOrSpecialChar: 'Cannot have space or special character',
  errNoSpecialChar: 'Cannot have special character',
  errProductNotSelected: 'Product not selected',
  errQtyCannotBeZero: 'Qty cannot be zero',
  errQtySrNoNotMatch: 'Qty and serial number count do not match',
  errRequired: 'This value is required',
  errRequiredShort: "Required",
  errSameAccountCannotAppearInDebitAndCredit: 'Same Account cannot appear in both Debit and Credit',
  errSameCurrentUidAndNewUid: 'Current uid and new uid cannot be same',
  errSameCurrentPwdAndNewPwd:
    'Current password and new password cannot be same',
  errSelectExportType: 'You must select an export type',
  errSgstValidationError: 'Sgst validation error',
  errSuperAdminRoleNameExists: 'Super admin role name alrady exists',
  errSuperAdminControlNameExists: 'Super admin control name already exists',
  errTagNameExists: 'Tag name altready exists',
  errUidExistsForClient: 'This uid already exists for the current client',
  errUpcCodeExists: 'UpcCode for the product already exists',
  errUnknown: 'An unknown error occurred in the operation',

  messAutoLinkBuiltinRoles: 'Add controls from built-in roles',
  messBranchSuccessfullySelected: 'The branch was successfully selected',
  messBusinessUsersUnlinkSuccess:
    'The selected business users were unlinked successfully',
  messBuCode:
    'Business unit code can be between 4 characters and 50 characters',
  messBuName:
    'Business unit name can be between 6 characters and 150 characters',
  messBuSuccessfullySelected: 'The business unit was successfully selected',
  messBusinessUsersDragFrom: 'Available business users (Drag a row)',
  messCannotDeleteSinceUsedInProduct:
    'Cannot delete because this brand is already used in a product',
  messClientCode:
    'Client code should be between 6 characters and 30 characters',
  messClientName:
    'Client name should be between 6 characters and 50 characters',
  messDbConnFailure: 'Database connection was failed',
  messDbConnSuccessful: 'Database connection was successful',
  messDebitCreditNotTogether:
    'Debit and credit entries are not allowed together',
  messDebitsNotEqualsCredits: 'Debits and credits are not equal',
  messEndDateGreaterThanStartDate:
    'End date must be greater than or equal to start date',
  messExistingLinksDropHere:
    'Existing Bu`s with links (Drop the dragged row here)',
  messExistingRolesWithLinksDropHere:
    'Existing roles with links (Drop the dragged row here)',
  messFinYearSuccessfullySelected:
    'The financial year was successfully selected',
  messFinYearSuccessfullyChanged: 'The financial year was successfully changed',
  messFailure: 'Failure',
  messLinkSecuredControl: 'Link a secured control with this role',
  messMax500Chars: 'Maximum 500 characters',
  messMustBeGESalePriceGst: 'Must be >= sale price with gst',
  messMustKeepOneRow: 'You must keep at least one row',
  messMin2CharsRequired: 'Minimum 2 characters required',
  messNoLeafNodeAllowed: 'Leaf nodes cannot be selected',
  messNoParentCategoryConfirm:
    'Are you sure you want to make this category a top-level category?',
  messNothingToDo: 'Nothing to do',
  messNotAllowed: 'This operation is not allowed',
  messNoBusinessUnitsDefined:
    'No business units are defined for this client. Admin must define at least one business unit',
  messOpeningBalancesMismatch: "There was error in opening balances of accounts. Sum of debits and credits do not match",
  messOpBalClearDateChangeNotAllowed:
    'Opening balance clear date cannot be changed',
  messOperationNotAllowed: 'This operation is not allowed',
  messPasswordHelper: 'At least 8 characters long | 1 digit | 1 special char',
  messRecordDeleted: 'The record was successfully deleted',
  messRoleName: 'Role name should be a string without any special character',
  messResetLinkSendFail:
    'Could not send reset link to the email address provided by you',
  messResetLinkSendSuccess: 'Successfully sent the email with the reset link',
  messResultSetEmpty: 'Result set is empty',
  messSecuredControlsDragFrom: 'Available secured controls (Drag a row)',
  messSecuredControlExists: 'Secured control already exists in the role',
  messSecuredControlName:
    'Secured control name should be a string without any space or special character',
  messSecuredControlsUnlinkSuccess:
    'The selected secured controls were unlinked successfully',
  messSelectClientName: 'Type first 6 chars to select a client name',
  messSelectBank: 'Select a bank by clicking the button below',
  messStockJournalDebitCreditMismatch: 'Stock journal Debis and Credits mismatch',
  messSuccess: 'Successfull',
  messSureToProceed: 'Are you sure to proceed?',
  messSureOnUnLinkSecuredControl:
    'Are you sure to unlink this secured control?',
  messSureOnUnLinkAllSecuredControls:
    'Are you sure to unlink all secured controls from this role?',
  messSureOnUnLinkAllBusinessUsers:
    'Are you sure to unlink all business users from this business unit (bu)?',
  messSureOnUnLinkSecuredControlBody:
    'The selected secured control will be unlinked from the role. The secured control will not be deleted.',
  messSureOnUnLinkBusinessUsersBody:
    'The selected business users will be unlinked from the business unit. The business user will not be deleted.',
  messSureOnUnLinkAllSecuredControlsBody:
    'All secured controls will be unlinked from this role. The secured controls will not be deleted.',
  messSureToTransferClosingBalance:
    "Are you sure you want to transfer this year's closing account balances to the next financial year for the selected branch?",
  messSureUnlinkUser: 'Are you sure to unlink this user?',
  messSureUnlinkUserBody:
    'The selected user will only be unlinked from the business unit. The user will not be deleted.',
  messTransferClosingBalance:
    'Transfer closing balances from current financial year to next financial year',
  messUnlinkBu: 'The business unit will be unlinked but not deleted. You can later on link the business unit',
  messUnlinkSecuredControl: 'Unlink this secured control from role',
  messUnlinkAllSecuredControl: 'Unlink all secured controls from this role',
  messUnlinkAllBusinessUsers:
    'Unlink all business users from this business unit (bu)',
  messUidExists: 'This uid already exists for current client',
  messUidHelper: 'At least 4 characters long | no space | no special char',
  messUnableToConnectToServer:
    'Unable to connect to server. Server may be offline',
  messUserExists: 'User already exists in the business unit',
  messUserNameEmailHelper:
    'UID: At least 4 characters long | no space | no special char or valid email',
  messUserNotAssociatedWithBu:
    'Current user is not associated with any business unit',
  messUserWillBeAdded: 'Dragged used will be added to the business unit',
  messUserUnlinkedSuccess: 'The selected user was unlinked successfully'
}

export { Messages }
