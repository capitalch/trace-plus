import { useNavigate } from "react-router-dom"
import { SignalsStore } from "../../app/signals-store"
import { UserTypesEnum } from "../../app/globals"
import { useAppUtils } from "../../app/app-utils-hook"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'

function useLogin() {
    const navigate = useNavigate()
    const { getHostUrl } = useAppUtils()

    function handleForgotPassword() {

    }

    async function onSubmit(data: any) {
        const hostUrl = getHostUrl()
        const loginUrl = urlJoin(hostUrl, 'login')
        try {
            const ret: any = await axios({
                method: 'post',
                url: loginUrl,
                data: qs.stringify({
                    username: data.username,
                    password: data.password
                }),
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
            })
            const accessToken = ret.data.accessToken
            if (accessToken) {
                SignalsStore.login.isLoggedIn.value = true
            }
        } catch (e: any) {
            console.log(e)
        }
    }

    // function handleSignIn() {
    //     SignalsStore.login.isLoggedIn.value = true
    //     navigate('/test', { replace: true })
    // }

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

    return ({ handleForgotPassword, handleTestSignIn, onSubmit })
}
export { useLogin }

// type LoginType = {
//     username: string
//     password: string
// }