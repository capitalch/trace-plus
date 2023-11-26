import { Messages } from "./messages"

function useAppValidators() {

    function checkAtLeast8Chars(input: string) {
        let error = null
        if (input.length < 8) {
            error = Messages.errAtLeast8Chars
        }
        return (error)
    }

    function checkMustHaveOneDigit(input: string) {
        let error = null
        if (input.search(/[0-9]/) < 0) {
            error = Messages.errMustHaveOneDigit
        }
        return error
    }

    function checkMustHaveOneLetter(input: string) {
        let error = null
        if (input.search(/[a-z]/i) < 0) {
            error = Messages.errMustHaveOneLetter
        }
        return error
    }

    function checkMustHaveOneSpecialChar(input: string) {
        let error = null
        if (input.search(/[!@#\\$%\\^&\\*_`~]/) < 0) {
            error = Messages.errMustHaveOneSpecialChar
        }
        return error
    }

    function checkNoSpaceOrSpecialChar(input: string) {
        let error = null
        if (input.search(/^[\w-_]*$/) < 0) {
            error = Messages.errNoSpceOrSpecialChar
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

    function checkRequired(input: string) {
        let error = null
        if (input.length === 0) {
            error = Messages.errRequired
        }
        return error
    }

    function checkUserNameOrEmail(input: string) {
        //should be alphanumeric, non empty and no space in between or email
        let error = null
        if (!isValidEmail(input)) {
            error = checkRequired(input) || checkNoSpaceOrSpecialChar(input)
        }
        if (error) {
            error = Messages.errInvalidUserNameOrEmail
        }
        return (error)
    }

    return ({ checkPassword, checkUserNameOrEmail })

    // Helper methods
    function isValidEmail(input: string) {
        const ret = input.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        return ret
    }
}



export { useAppValidators }