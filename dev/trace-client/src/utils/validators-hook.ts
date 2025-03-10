import { Messages } from "./messages";

function useValidators() {
  function checkAddress(input: string | undefined) {
    let error = undefined;
    if (input) {
      const regex = /^[a-zA-Z0-9\s,./\\()#\-_\\[\]]*$/;
      if (!regex.test(input)) {
        error = Messages.errInvalidAddress;
      }
    }
    return error;
  }

  function checkAllowSomeSpecialChars(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    if (input.search(/^[A-Za-z0-9 .@$#+:(),_-]+$/) < 0) {
      error = Messages.errForbiddenChar;
    }
    return error;
  }

  function checkAllowSomeSpecialChars1(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    if (input.search(/^[A-Za-z0-9 ()-]+$/) < 0) {
      error = Messages.errForbiddenChar;
    }
    return error;
  }

  function checkAtLeast8Chars(input: string) {
    let error = undefined;
    if (input.length < 8) {
      error = Messages.errAtLeast8Chars;
    }
    return error;
  }

  function checkEmail(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    if (!isValidEmail(input)) {
      error = Messages.errInvalidEmail;
    }
    return error;
  }

  function checkGstin(input: string | undefined) {
    let error = undefined;
    if (input) {
      if (!isValidGstin(input)) {
        error = Messages.errInvalidGstin;
      }
    }
    return error;
  }

  function checkGstStateCode(input: string) {
    let error = undefined;
    const regex = /^[1-9][0-9]?$/;
    if (!regex.test(input)) {
      error = Messages.errInvalidGstStateCode;
    }
    return error;
  }

  function checkLandPhone(input: string | undefined) {
    let error = undefined;
    if (input) {
      const regex = /^(?:\+91\s?|91\s?)?(?:\d{3,5}\s?\d{6,10}|\d{8,10})$/;
      if (!regex.test(input)) {
        error = Messages.errInvalidLandPhone;
      }
    }
    return error;
  }

  function checkLandPhones(input: string | undefined) {
    let error = undefined;
    if (input) {
      const regex =
        /^(?:\+91\s?|91\s?)?(?:\d{3,5}\s?\d{6,10}|\d{8,10})(?:[,\s]+(?:\+91\s?|91\s?)?(?:\d{3,5}\s?\d{6,10}|\d{8,10}))*$/;
      if (!regex.test(input)) {
        error = Messages.errInvalidLandPhone;
      }
    }
    return error;
  }

  function checkMobileNo(input: string) {
    let error = undefined;
    const regex = /^(?:\+91|91)?\s?\d{10}$/;
    if (!regex.test(input)) {
      error = Messages.errInvalidMobileNo;
    }
    return error;
  }

  function checkMobileNos(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    const regex = /^(?:\+91|91)?\s?\d{10}(?:[\s,](?:\+91|91)?\s?\d{10})*$/;
    if (!regex.test(input)) {
      error = Messages.errInvalidMobileNo;
    }
    return error;
  }

  function checkMustHaveOneDigit(input: string) {
    let error = undefined;
    if (input.search(/[0-9]/) < 0) {
      error = Messages.errMustHaveOneDigit;
    }
    return error;
  }

  function checkMustHaveOneLetter(input: string) {
    let error = undefined;
    if (input.search(/[a-z]/i) < 0) {
      error = Messages.errMustHaveOneLetter;
    }
    return error;
  }

  function checkMustHaveOneSpecialChar(input: string) {
    let error = undefined;
    if (input.search(/[!@#\\$%\\^&\\*_`~]/) < 0) {
      error = Messages.errMustHaveOneSpecialChar;
    }
    return error;
  }

  function checkNoSpaceOrSpecialChar(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    if (input.search(/^[\w-_]*$/) < 0) {
      error = Messages.errNoSpceOrSpecialChar;
    }
    return error;
  }

  function checkNoSpaceOrSpecialCharAllowDot(input: string) {
    let error = undefined;
    if (input.search(/^[\w-_.]*$/) < 0) {
      error = Messages.errNoSpceOrSpecialChar;
    }
    return error;
  }

  function checkNoSpecialChar(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    if (input.search(/[^\w\s-_]/) > 0) {
      error = Messages.errNoSpecialChar;
    }
    return error;
  }

  function checkPinCode(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    const regex = /^[1-9][0-9]{5}$/;
    if (!regex.test(input)) {
      error = Messages.errInvalidPinCode;
    }
    return error;
  }

  function checkRequired(input: string) {
    let error = undefined;
    if (input.length === 0) {
      error = Messages.errRequired;
    }
    return error;
  }

  function checkPassword(input: string) {
    const error =
      checkRequired(input) ||
      checkAtLeast8Chars(input) ||
      checkMustHaveOneLetter(input) ||
      checkMustHaveOneDigit(input) ||
      checkMustHaveOneSpecialChar(input);
    return error;
  }

  function checkUserNameOrEmail(input: string) {
    //should be alphanumeric, non empty and no space in between or email
    let error = undefined;
    if (!isValidEmail(input)) {
      error = checkRequired(input) || checkNoSpaceOrSpecialChar(input);
    }
    if (error) {
      error = Messages.errInvalidUserNameOrEmail;
    }
    return error;
  }

  function checkUrl(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    const regex =
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/;
    if (!regex.test(input)) {
      error = Messages.errInputMustBeUrl;
    }
    return error;
  }

  function shouldBePositive(input: number) {
    let error = undefined;
    const inp: number = +input;
    if (inp < 0) {
      error = Messages.errMustBePositive;
    }
    return error;
  }

  function shouldNotBeZero(input: number) {
    let error = undefined;
    const inp: number = +input;
    if (inp === 0) {
      error = Messages.errCannotBeZero;
    }
    return error;
  }

  return {
    checkAddress,
    checkAllowSomeSpecialChars,
    checkAllowSomeSpecialChars1,
    checkAtLeast8Chars,
    checkEmail,
    checkGstin,
    checkGstStateCode,
    checkLandPhone,
    checkLandPhones,
    checkMobileNo,
    checkMobileNos,
    checkNoSpaceOrSpecialChar,
    checkNoSpaceOrSpecialCharAllowDot,
    checkNoSpecialChar,
    checkPassword,
    checkPinCode,
    checkUrl,
    checkUserNameOrEmail,
    shouldBePositive,
    shouldNotBeZero,
  };

  // Helper methods
  function isValidEmail(input: string) {
    const ret = input.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return ret;
  }

  function isValidGstin(input: string) {
    const ret = input.match(
      /^([0][1-9]|[1-2][0-9]|[3][0-7])([A-Z]{5})([0-9]{4})([A-Z]{1}[1-9A-Z]{1})([Z]{1})([0-9A-Z]{1})+$/
    );
    return ret;
  }
}
export { useValidators };
