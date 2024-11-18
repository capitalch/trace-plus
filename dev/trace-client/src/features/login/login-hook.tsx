import { useDispatch, useSelector } from "react-redux"
import { AppDispatchType } from "../../app/store/store"
import { useNavigate } from "react-router-dom"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'
import { doLogin, doLogout, isLoggedInSelectorFn, LoginType, UserDetailsType } from "./login-slice"
import { Utils } from "../../utils/utils"
import { ForgotPassword } from "./forgot-password"
import { UserTypesEnum } from "../../utils/global-types-interfaces-enums"
import { useEffect } from "react"
import { GraphQLQueriesMap } from "../../app/graphql/maps/graphql-queries-map"
import { SqlIdsMap } from "../../app/graphql/maps/sql-ids-map"
import { Messages } from "../../utils/messages"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../app/global-constants"

function useLogin(setValue: any) {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()

    const isLoggedInSelector = useSelector(isLoggedInSelectorFn)

    useEffect(() => {
        // perhaps this is to be decided when bu is finally selected
        const loginInfo: LoginType = Utils.getCurrentLoginInfo()
        if (loginInfo.isLoggedIn && (loginInfo?.userDetails?.userType !== UserTypesEnum.SuperAdmin)) {
            fetchAccSettings()
        }
    }, [isLoggedInSelector])

    async function fetchAccSettings() { // fetches various settings and options from accounts database
        const loginInfo: LoginType = Utils.getCurrentLoginInfo()
        const userDetails: UserDetailsType = loginInfo.userDetails || {}
        const dbName: string = userDetails.dbName || ''
        const isExternalDb: boolean = userDetails.isExternalDb || false
        const dbParams: string | undefined = userDetails?.dbParams
        let dbParamsObject: any
        if (isExternalDb && dbParams) {
            const decodedDbParams = await Utils.decodeExtDbParams(dbParams)
            dbParamsObject = JSON.parse(decodedDbParams)
        }
        // if buCodes are not there then give message and exit
        // if((!loginInfo.userBusinessUnits) || (loginInfo.userBusinessUnits?.length === 0))
        if(!loginInfo?.currentBusinessUnit?.buCode){
            Utils.showFailureAlertMessage({title:Messages.messFailure,message:Messages.messNoBusinessUnitsDefined})
        }
        try {
            const q = GraphQLQueriesMap.genericQuery(dbName, {
                buCode: loginInfo.currentBusinessUnit?.buCode,
                dbParams: dbParamsObject,
                sqlId: SqlIdsMap.getSettingsFinYearsBranches,
                sqlArgs: {}
                // , sqlArgs: { clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId }
            });
            const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMap.genericQuery.name);
            console.log(res);
        } catch (e: any) {
            console.log(e?.message)
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errFailFetchingDataFromAccounts })
            dispatch(doLogout())
        }
        // setOptions(res.data.genericQuery);
    }

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