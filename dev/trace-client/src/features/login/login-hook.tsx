import { useDispatch, } from "react-redux"
import { AppDispatchType } from "../../app/store"
import { useNavigate } from "react-router-dom"
import urlJoin from "url-join"
import axios from "axios"
import qs from 'qs'
import { doLogin, LoginType, setToken, UserDetailsType, } from "./login-slice"
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
        }
    }

    async function onSubmit(data: any) {
        const hostUrl = Utils.getHostUrl()
        const loginUrl = urlJoin(hostUrl, 'api/login')
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
                dispatch(setToken(accessToken))
                await setDecodeExtDbParams(payloadData)
                dispatch(doLogin({
                    allBusinessUnits: payloadData.allBusinessUnits,
                    allSecuredControls: payloadData.allSecuredControls,
                    isLoggedIn: true,
                    role: payloadData.role,
                    token: accessToken,
                    userBusinessUnits: payloadData.userBusinessUnits,
                    userDetails: payloadData.userDetails,
                    userSecuredControls: testUserSecuredControls, // payloadData.userSecuredControls
                }))
                navigate('/', { replace: true })
            }
        } catch (error: any) {
            Utils.showErrorMessage(error)
        }
    }

    async function setDecodeExtDbParams(payloadData: LoginType) {
        const userDetails: UserDetailsType = payloadData.userDetails || {}
        const isExternalDb: boolean = userDetails.isExternalDb || false
        const dbParams: string | undefined = userDetails?.dbParams
        let dbParamsObject: any
        if (isExternalDb && dbParams && payloadData?.userDetails) {
            dbParamsObject = await Utils.decodeExtDbParams(dbParams)
            payloadData.userDetails.decodedDbParamsObject = dbParamsObject
        }
    }

    return ({ handleForgotPassword, handleTestSignIn, onSubmit })
}
export { useLogin }

const testUserSecuredControls = [
  {
    "controlNo": 100,
    "controlName": "vouchers.menu.all-vouchers.view",
    "controlType": "menu",
    "descr": "Can view 'All Vouchers' menu item in sidebar"
  },
  {
    "controlNo": 110,
    "controlName": "vouchers.payment.view",
    "controlType": "action",
    "descr": "Can view Payment voucher type button and view Payment vouchers"
  },
  {
    "controlNo": 111,
    "controlName": "vouchers.payment.select",
    "controlType": "action",
    "descr": "Can select Payment vouchers from list"
  },
  {
    "controlNo": 112,
    "controlName": "vouchers.payment.create",
    "controlType": "action",
    "descr": "Can create new Payment vouchers"
  },
  {
    "controlNo": 113,
    "controlName": "vouchers.payment.edit",
    "controlType": "action",
    "descr": "Can edit existing Payment vouchers"
  },
  {
    "controlNo": 114,
    "controlName": "vouchers.payment.delete",
    "controlType": "action",
    "descr": "Can delete Payment vouchers"
  },
  {
    "controlNo": 115,
    "controlName": "vouchers.payment.preview1",
    "controlType": "action",
    "descr": "Can preview Payment vouchers"
  },
  {
    "controlNo": 116,
    "controlName": "vouchers.payment.export",
    "controlType": "action",
    "descr": "Can export Payment vouchers to PDF/Excel"
  },
  {
    "controlNo": 120,
    "controlName": "vouchers.receipt.view",
    "controlType": "action",
    "descr": "Can view Receipt voucher type button and view Receipt vouchers"
  },
  {
    "controlNo": 121,
    "controlName": "vouchers.receipt.select",
    "controlType": "action",
    "descr": "Can select Receipt vouchers from list"
  },
  {
    "controlNo": 122,
    "controlName": "vouchers.receipt.create",
    "controlType": "action",
    "descr": "Can create new Receipt vouchers"
  },
  {
    "controlNo": 123,
    "controlName": "vouchers.receipt.edit",
    "controlType": "action",
    "descr": "Can edit existing Receipt vouchers"
  },
  {
    "controlNo": 124,
    "controlName": "vouchers.receipt.delete",
    "controlType": "action",
    "descr": "Can delete Receipt vouchers"
  },
  {
    "controlNo": 125,
    "controlName": "vouchers.receipt.preview",
    "controlType": "action",
    "descr": "Can preview Receipt vouchers"
  },
  {
    "controlNo": 126,
    "controlName": "vouchers.receipt.export",
    "controlType": "action",
    "descr": "Can export Receipt vouchers to PDF/Excel"
  },
  {
    "controlNo": 130,
    "controlName": "vouchers.contra.view",
    "controlType": "action",
    "descr": "Can view Contra voucher type button and view Contra vouchers"
  },
  {
    "controlNo": 131,
    "controlName": "vouchers.contra.select",
    "controlType": "action",
    "descr": "Can select Contra vouchers from list"
  },
  {
    "controlNo": 132,
    "controlName": "vouchers.contra.create",
    "controlType": "action",
    "descr": "Can create new Contra vouchers"
  },
  {
    "controlNo": 133,
    "controlName": "vouchers.contra.edit",
    "controlType": "action",
    "descr": "Can edit existing Contra vouchers"
  },
  {
    "controlNo": 134,
    "controlName": "vouchers.contra.delete",
    "controlType": "action",
    "descr": "Can delete Contra vouchers"
  },
  {
    "controlNo": 135,
    "controlName": "vouchers.contra.preview",
    "controlType": "action",
    "descr": "Can preview Contra vouchers"
  },
  {
    "controlNo": 136,
    "controlName": "vouchers.contra.export",
    "controlType": "action",
    "descr": "Can export Contra vouchers to PDF/Excel"
  },
  {
    "controlNo": 140,
    "controlName": "vouchers.journal.view",
    "controlType": "action",
    "descr": "Can view Journal voucher type button and view Journal vouchers"
  },
  {
    "controlNo": 141,
    "controlName": "vouchers.journal.select",
    "controlType": "action",
    "descr": "Can select Journal vouchers from list"
  },
  {
    "controlNo": 142,
    "controlName": "vouchers.journal.create",
    "controlType": "action",
    "descr": "Can create new Journal vouchers"
  },
  {
    "controlNo": 143,
    "controlName": "vouchers.journal.edit",
    "controlType": "action",
    "descr": "Can edit existing Journal vouchers"
  },
  {
    "controlNo": 144,
    "controlName": "vouchers.journal.delete",
    "controlType": "action",
    "descr": "Can delete Journal vouchers"
  },
  {
    "controlNo": 145,
    "controlName": "vouchers.journal.preview",
    "controlType": "action",
    "descr": "Can preview Journal vouchers"
  },
  {
    "controlNo": 146,
    "controlName": "vouchers.journal.export",
    "controlType": "action",
    "descr": "Can export Journal vouchers to PDF/Excel"
  }
]