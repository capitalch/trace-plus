import { useDispatch } from "react-redux"
import { AppDispatchType } from "../../app/store/store"
import { doLogin } from "../../app/store/app-slice"
import { useNavigate } from "react-router-dom"
import { useUtils } from "../../utils/utils-hook"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'
// import { useEffect } from "react"

function useLogin() {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()
    const { getHostUrl } = useUtils()
    function handleForgotPassword() {

    }

    function handleTestSignIn(userType: string) {
        dispatch(doLogin({ email: '', uid: '', userType: userType, isLoggedIn: true }))
        navigate('/', { replace: true })
    }

    // useEffect(() => {throw new Error('Failed to login')},[])

    async function onSubmit(data: any) {
        const hostUrl = getHostUrl()
        const loginUrl = urlJoin(hostUrl, 'login')
        // throw new Error('Failed to login')
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
                navigate('/', { replace: true })
            }
        } catch (error) {
            alert('failed to login')
            // throw new Error('Failed to login')
        }
    }

    return ({ handleForgotPassword, handleTestSignIn, onSubmit })

}
export { useLogin }