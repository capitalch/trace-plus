import { useDispatch } from "react-redux"
import { AppDispatchType } from "../../app/store/store"
import { useNavigate } from "react-router-dom"
import { useUtils } from "../../utils/util-hook"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'
import { showSaveMessage } from "../../utils/util-methods/show-save-message"
import { showErrorMessage } from "../../utils/util-methods/show-error-message"
import { doLoginR } from "./login-slice"

function useLogin() {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()
    const { getHostUrl } = useUtils()

    function handleForgotPassword() {
        showSaveMessage()
    }

    function handleTestSignIn(userType: any) {
        dispatch(doLoginR({
            isLoggedIn: true,
            businessUnits: [],
            clientCode: undefined,
            clientId: undefined,
            clientName: undefined,
            email: undefined,
            isClentActive: false,
            isUserActive: false,
            lastUsedBranchId: undefined,
            lastUsedBuId: undefined,
            mobileNo: undefined,
            name: undefined,
            token: undefined,
            uid: undefined,
            userType: userType
        }))
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
            const payloadData: any = ret?.data?.payload
            if (accessToken) {
                dispatch(doLoginR({
                    isLoggedIn: true,
                    businessUnits: payloadData?.businessUnits,
                    clientCode: payloadData?.clientCode,
                    clientId: payloadData?.clientId,
                    clientName: payloadData?.clientName,
                    email: payloadData?.email,
                    isClentActive: payloadData?.isClentActive,
                    isUserActive: payloadData?.isUserActive,
                    lastUsedBranchId: payloadData?.lastUsedBrandId,
                    lastUsedBuId: payloadData?.lastUsedBuId,
                    mobileNo: payloadData?.mobileNo,
                    name: payloadData?.name,
                    token: accessToken,
                    uid: payloadData?.uid,
                    userType: payloadData?.userType
                }))
                navigate('/', { replace: true })
            }
        } catch (error: any) {
            showErrorMessage(error)
        }
    }
    return ({ handleForgotPassword, handleTestSignIn, onSubmit })
}
export { useLogin }

export type UserLoginPayloadType = {
    businessUnits: string[]
    clientCode: string
    clientId: string
    clientName: string
    email: string
    isClentActive: boolean
    isUserActive: boolean
    lastUsedBrandId: string
    lastUsedBuId: string
    mobileNo: string
    name: string
    uid: string
    userType: string
}