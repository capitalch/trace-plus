import { useDispatch } from "react-redux"
import { AppDispatchType } from "../../app/store/store"
import { useNavigate } from "react-router-dom"
import { useUtils } from "../../utils/utils-hook"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'
import { showSaveMessage } from "../../utils/util-methods/show-save-message"
import { showErrorMessage } from "../../utils/util-methods/show-error-message"
import { AppGlobalContextType } from "../../app/global-context/app-global-context"
import { useContext } from "react"
import { AppGlobalContext } from "../../App"
import { doLogin } from "./login-slice"

function useLogin() {
    const dispatch: AppDispatchType = useDispatch()
    const globalContext: AppGlobalContextType = useContext(AppGlobalContext)
    const navigate = useNavigate()
    const { getHostUrl } = useUtils()

    function handleForgotPassword() {
        showSaveMessage()
    }

    function handleTestSignIn(userType: string) {
        dispatch(doLogin({ email: '', uid: '', userType: userType, isLoggedIn: true }))
        navigate('/', { replace: true })
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
            const accessToken: string = ret?.data?.accessToken
            if (accessToken) {
                dispatch(doLogin({ email: '', uid: '', userType: '', isLoggedIn: true }))

                globalContext.accessToken = accessToken

                navigate('/', { replace: true })
            }
        } catch (error: any) {
            showErrorMessage(error)
        }
    }
    return ({ handleForgotPassword, handleTestSignIn, onSubmit })
}
export { useLogin }