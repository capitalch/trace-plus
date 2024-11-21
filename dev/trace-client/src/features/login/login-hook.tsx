import { useDispatch, } from "react-redux"
import { AppDispatchType } from "../../app/store/store"
import { useNavigate } from "react-router-dom"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'
import { doLogin, LoginType, } from "./login-slice"
import { Utils } from "../../utils/utils"
import { ForgotPassword } from "./forgot-password"
import { UserTypesEnum } from "../../utils/global-types-interfaces-enums"

function useLogin(setValue: any) {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()

    function handleForgotPassword() {
        Utils.showHideModalDialogA({
            title: 'Forgot password',
            element: <ForgotPassword />,
            isOpen: true
        })
    }

    function handleTestSignIn(userType: any) {
        if (userType === UserTypesEnum.SuperAdmin) {
            setValue('username', 'superAdmin')
            setValue('password', 'superadmin@123')
        } else if (userType === UserTypesEnum.Admin) {
            setValue('username', 'capital')
            setValue('password', 'su$hant123')
        } else if (userType === UserTypesEnum.BusinessUser) {
            console.log('')
        }
    }

    async function onSubmit(data: any) {
        const hostUrl = Utils.getHostUrl()
        const loginUrl = urlJoin(hostUrl, 'login')
        try {
            const ret: any = await axios({
                method: 'post',
                url: loginUrl,
                data: qs.stringify({
                    clientId: data?.clientId,
                    username: data.username,
                    password: data.password
                }),
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
            })
            const accessToken: string = ret?.data?.accessToken
            const payloadData: LoginType = ret?.data?.payload
            if (accessToken) {
                dispatch(doLogin({
                    allBusinessUnits: payloadData.allBusinessUnits,
                    allSecuredControls: payloadData.allSecuredControls,
                    isLoggedIn: true,
                    role: payloadData.role,
                    token: accessToken,
                    userBusinessUnits: payloadData.userBusinessUnits,
                    userDetails: payloadData.userDetails,
                    userSecuredControls: payloadData.userSecuredControls
                }))
                navigate('/', { replace: true })
            }
        } catch (error: any) {
            Utils.showErrorMessage(error)
        }
    }

    return ({ handleForgotPassword, handleTestSignIn, onSubmit })
}
export { useLogin }