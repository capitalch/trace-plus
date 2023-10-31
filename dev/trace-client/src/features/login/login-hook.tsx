import { useNavigate } from "react-router-dom"
import { SignalsStore } from "../../app/signals-store"
import { UserTypesEnum } from "../../app/globals"

function useLogin() {
    const navigate = useNavigate()
    function handleForgotPassword() {

    }

    function handleSignIn() {
        SignalsStore.login.isLoggedIn.value = true
        navigate('/test', { replace: true })
    }

    function handleTestSignIn(userType: string) {
        const logic: any = {
            superAdmin: UserTypesEnum.SUPER_ADMIN,
            admin: UserTypesEnum.ADMIN,
            businessUser: UserTypesEnum.BUSINESS_USER
        }
        SignalsStore.login.userType.value = logic[userType]
        SignalsStore.login.isLoggedIn.value = true
        navigate('/test', { replace: true })
    }

    return ({ handleForgotPassword, handleSignIn, handleTestSignIn })
}
export { useLogin }