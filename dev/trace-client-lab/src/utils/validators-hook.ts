import { isWithinInterval, parseISO } from "date-fns";
import { Messages } from "./messages";
import { useUtilsInfo } from "./utils-info-hook";

function useValidators() {
  const { currentFinYear } = useUtilsInfo();
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

  function checkAllowedDate(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    const dateToCheck = parseISO(input);
    const startDate = parseISO(currentFinYear?.startDate || "");
    const endDate = parseISO(currentFinYear?.endDate || "");
    const isBetween = isWithinInterval(dateToCheck, {
      start: startDate,
      end: endDate,
    });
    if (!isBetween) {
      error = Messages.errInvalidDate;
    }
    return error;
  }

  function checkAllowSomeSpecialChars(input: string | undefined | null) {
    let error = undefined;
    if (!input) {
      return error;
    }
    if (input.search(/^[A-Za-z0-9 *&.@$#+:(),_-]+$/) < 0) {
      error = Messages.errForbiddenChar;
    }
    return error;
  }

  function checkAllowSomeSpecialChars1(input: string | undefined) {
    let error = undefined;
    if (!input) {
      return error;
    }
    if (input.search(/^[A-Za-z0-9 ()-_+*]+$/) < 0) {
      error = Messages.errForbiddenChar1;
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

  function checkHsn(input: string | undefined) {
    let error = undefined;
    if (input) {
      if (!isValidHsn(input)) {
        error = Messages.errInvalidHsn;
      }
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

  function checkIpAddress(input: string) {
    let error = undefined;
    const regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    if (!regex.test(input)) {
      error = Messages.errInvalidIpAddress;
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
    checkAllowedDate,
    checkAllowSomeSpecialChars,
    checkAllowSomeSpecialChars1,
    checkAtLeast8Chars,
    checkEmail,
    checkGstin,
    checkHsn,
    checkGstStateCode,
    checkIpAddress,
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
    isValidGstin,
    isValidHsn,
    isValidEmail,
    shouldBePositive,
    shouldNotBeZero,
  };

  // Helper methods
  function isValidEmail(input: string) {
    if (!input || input.length === 0) return false;
    
    // Check for basic structure first
    if (!/^[^@\s]+@[^@\s]+$/.test(input)) return false;
    
    // Split into local and domain parts
    const parts = input.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domainPart] = parts;
    
    // Validate local part (before @)
    if (!localPart || localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) return false;
    
    // Validate domain part (after @)
    if (!domainPart || domainPart.length === 0 || domainPart.length > 255) return false;
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
    if (domainPart.includes('..')) return false;
    
    // Split domain into labels
    const domainLabels = domainPart.split('.');
    if (domainLabels.length < 2) return false; // Must have at least domain.tld
    
    // Validate each domain label
    for (const label of domainLabels) {
      if (!label || label.length === 0 || label.length > 63) return false;
      if (label.startsWith('-') || label.endsWith('-')) return false;
      if (!/^[a-zA-Z0-9-]+$/.test(label)) return false;
    }
    
    // Validate TLD (last label) - must be at least 2 characters and only letters
    const tld = domainLabels[domainLabels.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    
    return true;
  }

  function isValidGstin(input: string) {
    const ret = input.match(
      /^([0][1-9]|[1-2][0-9]|[3][0-7])([A-Z]{5})([0-9]{4})([A-Z]{1}[1-9A-Z]{1})([Z]{1})([0-9A-Z]{1})+$/
    );
    return ret;
  }

  function isValidHsn(input: string) {
    const ret = input.match(
      /^\d+$/
    ) && input.length >= 4 && input.length <= 8;
    return ret;
  }


}
export { useValidators };
