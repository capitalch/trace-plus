const Messages = {
  errAtLeast4Chars: 'Should be at least 4 chars long',
  errAtLeast8Chars: 'Should be at least 8 chars long',
  errAtLeast6Chars: 'Should be at least 6 chars long',
  errAtMost10Chars: 'Should be at most 10 chars long',
  errAtMost30Chars: 'Should be at most 30 chars long',
  errAtMost50Chars: 'Should be at most 50 chars long',
  errCannotBeZero: 'Cannot have zero values',
  errClientCodeExists: 'Client code altready exists',
  errClientNameExists: 'Client name already exists',
  errExtDbParamsFormatError:
    'External database parameters are not in proper format',
  errInputMustBeUrl: 'Input must be a valid URL',
  errInvalidEmail: 'Invalid email',
  errInvalidUserNameOrEmail: 'Invalid user name or email address',
  errMustBePositive: 'Must be a positive number',
  errMustHaveOneDigit: 'Should have a digit',
  errMustHaveOneLetter: 'Should have one letter',
  errMustHaveOneSpecialChar: 'Must have a special character',
  errNoSpceOrSpecialChar: 'Cannot have space or special character',
  errNoSpecialChar: 'Cannot have special character',
  errSuperAdminRoleNameExists:"Super admin role name alrady exists",
  errSuperAdminControlNameExists:"Super admin control name already exists",
  errUnknown: 'An unknown error occurred in the operation',
  errRequired: 'This value is required',

  messClientCode:
    'Client code should be between 6 characters and 10 characters',
  messClientName:
    'Client name should be between 6 characters and 50 characters',
  messDbConnFailure: 'Database connection was failed',
  messDbConnSuccessful: 'Database connection was successful',
  messFailure: 'Failure',
  messPasswordHelper: 'At least 8 characters long | 1 digit | 1 special char',
  messRecordDeleted: 'The record was successfully deleted',
  messRoleName:'Role name should be a string without any special character',
  messSecuredControlName:'Secured control name should be a string without any space or special character',
  messSuccess: 'Successfull',
  messUserNameEmailHelper:
    'At least 4 characters long | no space | no special char',
  
}

export { Messages }
