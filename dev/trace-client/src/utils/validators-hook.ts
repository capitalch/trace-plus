import { Messages } from './messages'

function useValidators() {
  function checkAtLeast8Chars(input: string) {
    let error = undefined
    if (input.length < 8) {
      error = Messages.errAtLeast8Chars
    }
    return error
  }

  function checkMustHaveOneDigit(input: string) {
    let error = undefined
    if (input.search(/[0-9]/) < 0) {
      error = Messages.errMustHaveOneDigit
    }
    return error
  }

  function checkMustHaveOneLetter(input: string) {
    let error = undefined
    if (input.search(/[a-z]/i) < 0) {
      error = Messages.errMustHaveOneLetter
    }
    return error
  }

  function checkMustHaveOneSpecialChar(input: string) {
    let error = undefined
    if (input.search(/[!@#\\$%\\^&\\*_`~]/) < 0) {
      error = Messages.errMustHaveOneSpecialChar
    }
    return error
  }

  function checkNoSpaceOrSpecialChar(input: string) {
    let error = undefined
    if (input.search(/^[\w-_]*$/) < 0) {
      error = Messages.errNoSpceOrSpecialChar
    }
    return error
  }

  function checkNoSpecialChar(input: string) {
    let error = undefined
    if (input.search(/[^\w\s]/) > 0) {
      error = Messages.errNoSpecialChar
    }
    return error
  }

  function checkRequired(input: string) {
    let error = undefined
    if (input.length === 0) {
      error = Messages.errRequired
    }
    return error
  }

  function checkPassword(input: string) {
    const error =
      checkRequired(input) ||
      checkAtLeast8Chars(input) ||
      checkMustHaveOneLetter(input) ||
      checkMustHaveOneDigit(input) ||
      checkMustHaveOneSpecialChar(input)
    return error
  }



  function checkUserNameOrEmail(input: string) {
    //should be alphanumeric, non empty and no space in between or email
    let error = undefined
    if (!isValidEmail(input)) {
      error = checkRequired(input) || checkNoSpaceOrSpecialChar(input)
    }
    if (error) {
      error = Messages.errInvalidUserNameOrEmail
    }
    return error
  }

  function checkUrl(input: string) {

    let error = undefined
    if (!input) {
      return (error)
    }
    if (input.search(/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})$/) < 0) {
      error = Messages.errInputMustBeUrl
    }
    return (error)
  }

  function shouldNotBeZero(input: number): boolean {
    let ret = true
    if (input === 0) {
      ret = false
    }
    return (ret)
  }

  return {
    checkNoSpaceOrSpecialChar,
    checkNoSpecialChar,
    checkPassword,
    checkUrl,
    checkUserNameOrEmail,
    shouldNotBeZero
  }

  // Helper methods
  function isValidEmail(input: string) {
    const ret = input.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    return ret
  }
}
export { useValidators }
