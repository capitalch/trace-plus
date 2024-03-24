import { useDispatch } from "react-redux"
import { AppDispatchType } from "../../app/store/store"
import { useNavigate } from "react-router-dom"
import { useUtils } from "../../utils/utils-hook"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'
import { showSaveMessage } from "../../utils/utils-methods/show-save-message"
import { showErrorMessage } from "../../utils/utils-methods/show-error-message"
import { doLoginR } from "./login-slice"

function useLogin() {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()
    const { getHostUrl } = useUtils()

    function handleForgotPassword() {
        showSaveMessage()
    }

    function handleTestSignIn(userType: string) {
        dispatch(doLoginR({ email: '', uid: '', userType: userType, isLoggedIn: true, token: '' }))
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
                dispatch(doLoginR({ email: '', uid: '', userType: '', isLoggedIn: true, token: accessToken }))
                navigate('/', { replace: true })
            }
        } catch (error: any) {
            showErrorMessage(error)
        }
    }
    return ({ handleForgotPassword, handleTestSignIn, onSubmit })
}
export { useLogin }