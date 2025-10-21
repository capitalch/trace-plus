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
    "controlName": "vouchers.payment.preview",
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
  },
  {
    "controlNo": 201,
    "controlName": "purchase.view",
    "controlType": "action",
    "descr": "Can view Purchase records and access View tab"
  },
  {
    "controlNo": 202,
    "controlName": "purchase.create",
    "controlType": "action",
    "descr": "Can create new Purchase records"
  },
  {
    "controlNo": 203,
    "controlName": "purchase.edit",
    "controlType": "action",
    "descr": "Can edit existing Purchase records"
  },
  {
    "controlNo": 204,
    "controlName": "purchase.delete",
    "controlType": "action",
    "descr": "Can delete Purchase records"
  },
  {
    "controlNo": 205,
    "controlName": "purchase.preview",
    "controlType": "action",
    "descr": "Can preview Purchase records"
  },
  {
    "controlNo": 206,
    "controlName": "purchase.export",
    "controlType": "action",
    "descr": "Can export Purchase records to PDF/Excel"
  },
  {
    "controlNo": 211,
    "controlName": "purchase-return.view",
    "controlType": "action",
    "descr": "Can view Purchase Return records and access View tab"
  },
  {
    "controlNo": 212,
    "controlName": "purchase-return.create",
    "controlType": "action",
    "descr": "Can create new Purchase Return records"
  },
  {
    "controlNo": 213,
    "controlName": "purchase-return.edit",
    "controlType": "action",
    "descr": "Can edit existing Purchase Return records"
  },
  {
    "controlNo": 214,
    "controlName": "purchase-return.delete",
    "controlType": "action",
    "descr": "Can delete Purchase Return records"
  },
  {
    "controlNo": 215,
    "controlName": "purchase-return.preview",
    "controlType": "action",
    "descr": "Can preview Purchase Return records"
  },
  {
    "controlNo": 216,
    "controlName": "purchase-return.export",
    "controlType": "action",
    "descr": "Can export Purchase Return records to PDF/Excel"
  },
  {
    "controlNo": 221,
    "controlName": "sales.view",
    "controlType": "action",
    "descr": "Can view Sales records and access View tab"
  },
  {
    "controlNo": 222,
    "controlName": "sales.create",
    "controlType": "action",
    "descr": "Can create new Sales records"
  },
  {
    "controlNo": 223,
    "controlName": "sales.edit",
    "controlType": "action",
    "descr": "Can edit existing Sales records"
  },
  {
    "controlNo": 224,
    "controlName": "sales.delete",
    "controlType": "action",
    "descr": "Can delete Sales records"
  },
  {
    "controlNo": 225,
    "controlName": "sales.preview",
    "controlType": "action",
    "descr": "Can preview Sales records"
  },
  {
    "controlNo": 226,
    "controlName": "sales.export",
    "controlType": "action",
    "descr": "Can export Sales records to PDF/Excel"
  },
  {
    "controlNo": 231,
    "controlName": "sales-return.view",
    "controlType": "action",
    "descr": "Can view Sales Return records and access View tab"
  },
  {
    "controlNo": 232,
    "controlName": "sales-return.create",
    "controlType": "action",
    "descr": "Can create new Sales Return records"
  },
  {
    "controlNo": 233,
    "controlName": "sales-return.edit",
    "controlType": "action",
    "descr": "Can edit existing Sales Return records"
  },
  {
    "controlNo": 234,
    "controlName": "sales-return.delete",
    "controlType": "action",
    "descr": "Can delete Sales Return records"
  },
  {
    "controlNo": 235,
    "controlName": "sales-return.preview",
    "controlType": "action",
    "descr": "Can preview Sales Return records"
  },
  {
    "controlNo": 236,
    "controlName": "sales-return.export",
    "controlType": "action",
    "descr": "Can export Sales Return records to PDF/Excel"
  },
  {
    "controlNo": 241,
    "controlName": "debit-notes.view",
    "controlType": "action",
    "descr": "Can view Debit Notes records and access View tab"
  },
  {
    "controlNo": 242,
    "controlName": "debit-notes.create",
    "controlType": "action",
    "descr": "Can create new Debit Notes"
  },
  {
    "controlNo": 243,
    "controlName": "debit-notes.edit",
    "controlType": "action",
    "descr": "Can edit existing Debit Notes"
  },
  {
    "controlNo": 244,
    "controlName": "debit-notes.delete",
    "controlType": "action",
    "descr": "Can delete Debit Notes"
  },
  {
    "controlNo": 245,
    "controlName": "debit-notes.preview",
    "controlType": "action",
    "descr": "Can preview Debit Notes"
  },
  {
    "controlNo": 246,
    "controlName": "debit-notes.export",
    "controlType": "action",
    "descr": "Can export Debit Notes to PDF/Excel"
  },
  {
    "controlNo": 251,
    "controlName": "credit-notes.view",
    "controlType": "action",
    "descr": "Can view Credit Notes records and access View tab"
  },
  {
    "controlNo": 252,
    "controlName": "credit-notes.create",
    "controlType": "action",
    "descr": "Can create new Credit Notes"
  },
  {
    "controlNo": 253,
    "controlName": "credit-notes.edit",
    "controlType": "action",
    "descr": "Can edit existing Credit Notes"
  },
  {
    "controlNo": 254,
    "controlName": "credit-notes.delete",
    "controlType": "action",
    "descr": "Can delete Credit Notes"
  },
  {
    "controlNo": 255,
    "controlName": "credit-notes.preview",
    "controlType": "action",
    "descr": "Can preview Credit Notes"
  },
  {
    "controlNo": 256,
    "controlName": "credit-notes.export",
    "controlType": "action",
    "descr": "Can export Credit Notes to PDF/Excel"
  },
  {
    "controlNo": 1000,
    "controlName": "vouchers.menu.parent.view",
    "controlType": "menu",
    "descr": "Can view 'Vouchers' parent menu item in sidebar",
    "menuType": "accounts",
    "itemType": "parent",
    "menuId": "1"
  },
  {
    "controlNo": 1100,
    "controlName": "vouchers.menu.all-vouchers.view",
    "controlType": "menu",
    "descr": "Can view 'All Vouchers' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "10"
  },
  {
    "controlNo": 1010,
    "controlName": "purchase-sales.menu.parent.view",
    "controlType": "menu",
    "descr": "Can view 'Purch / Sales' parent menu item in sidebar",
    "menuType": "accounts",
    "itemType": "parent",
    "menuId": "2"
  },
  {
    "controlNo": 1110,
    "controlName": "purchase-sales.menu.purchase.view",
    "controlType": "menu",
    "descr": "Can view 'Purchase' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "21"
  },
  {
    "controlNo": 1111,
    "controlName": "purchase-sales.menu.purchase-return.view",
    "controlType": "menu",
    "descr": "Can view 'Purchase Return' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "22"
  },
  {
    "controlNo": 1112,
    "controlName": "purchase-sales.menu.sales.view",
    "controlType": "menu",
    "descr": "Can view 'Sales' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "23"
  },
  {
    "controlNo": 1113,
    "controlName": "purchase-sales.menu.sales-return.view",
    "controlType": "menu",
    "descr": "Can view 'Sales Return' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "24"
  },
  {
    "controlNo": 1114,
    "controlName": "purchase-sales.menu.debit-notes.view",
    "controlType": "menu",
    "descr": "Can view 'Debit Notes' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "25"
  },
  {
    "controlNo": 1115,
    "controlName": "purchase-sales.menu.credit-notes.view",
    "controlType": "menu",
    "descr": "Can view 'Credit Notes' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "26"
  },
  {
    "controlNo": 1020,
    "controlName": "masters.menu.parent.view",
    "controlType": "menu",
    "descr": "Can view 'Masters' parent menu item in sidebar",
    "menuType": "accounts",
    "itemType": "parent",
    "menuId": "3"
  },
  {
    "controlNo": 1200,
    "controlName": "masters.menu.company-info.view",
    "controlType": "menu",
    "descr": "Can view 'Company Info' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "31"
  },
  {
    "controlNo": 1201,
    "controlName": "masters.menu.general-settings.view",
    "controlType": "menu",
    "descr": "Can view 'General Settings' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "32"
  },
  {
    "controlNo": 1202,
    "controlName": "masters.menu.accounts-master.view",
    "controlType": "menu",
    "descr": "Can view 'Accounts Master' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "33"
  },
  {
    "controlNo": 1203,
    "controlName": "masters.menu.opening-balances.view",
    "controlType": "menu",
    "descr": "Can view 'Opening Balances' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "34"
  },
  {
    "controlNo": 1204,
    "controlName": "masters.menu.branches.view",
    "controlType": "menu",
    "descr": "Can view 'Branches' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "35"
  },
  {
    "controlNo": 1205,
    "controlName": "masters.menu.financial-years.view",
    "controlType": "menu",
    "descr": "Can view 'Financial Years' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "36"
  },
  {
    "controlNo": 1030,
    "controlName": "final-accounts.menu.parent.view",
    "controlType": "menu",
    "descr": "Can view 'Final Accounts' parent menu item in sidebar",
    "menuType": "accounts",
    "itemType": "parent",
    "menuId": "4"
  },
  {
    "controlNo": 1300,
    "controlName": "final-accounts.menu.trial-balance.view",
    "controlType": "menu",
    "descr": "Can view 'Trial Balance' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "41"
  },
  {
    "controlNo": 1301,
    "controlName": "final-accounts.menu.balance-sheet.view",
    "controlType": "menu",
    "descr": "Can view 'Balance Sheet' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "42"
  },
  {
    "controlNo": 1302,
    "controlName": "final-accounts.menu.pl-account.view",
    "controlType": "menu",
    "descr": "Can view 'PL Account' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "43"
  },
  {
    "controlNo": 1303,
    "controlName": "final-accounts.menu.general-ledger.view",
    "controlType": "menu",
    "descr": "Can view 'General Ledger' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "44"
  },
  {
    "controlNo": 1040,
    "controlName": "options.menu.parent.view",
    "controlType": "menu",
    "descr": "Can view 'Options' parent menu item in sidebar",
    "menuType": "accounts",
    "itemType": "parent",
    "menuId": "5"
  },
  {
    "controlNo": 1350,
    "controlName": "options.menu.bank-recon.view",
    "controlType": "menu",
    "descr": "Can view 'Bank Recon' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "51"
  },
  {
    "controlNo": 1351,
    "controlName": "options.menu.common-utilities.view",
    "controlType": "menu",
    "descr": "Can view 'Common Utilities' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "52"
  },
  {
    "controlNo": 1352,
    "controlName": "options.menu.exports.view",
    "controlType": "menu",
    "descr": "Can view 'Exports' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "53"
  },
  {
    "controlNo": 1050,
    "controlName": "reports.menu.parent.view",
    "controlType": "menu",
    "descr": "Can view 'Reports' parent menu item in sidebar",
    "menuType": "accounts",
    "itemType": "parent",
    "menuId": "6"
  },
  {
    "controlNo": 1370,
    "controlName": "reports.menu.all-transactions.view",
    "controlType": "menu",
    "descr": "Can view 'All Transactions' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "61"
  },
  {
    "controlNo": 1060,
    "controlName": "inventory.menu.parent.view",
    "controlType": "menu",
    "descr": "Can view 'Inventory' parent menu item in sidebar",
    "menuType": "accounts",
    "itemType": "parent",
    "menuId": "7"
  },
  {
    "controlNo": 1380,
    "controlName": "inventory.menu.categories.view",
    "controlType": "menu",
    "descr": "Can view 'Categories' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "71"
  },
  {
    "controlNo": 1381,
    "controlName": "inventory.menu.brands.view",
    "controlType": "menu",
    "descr": "Can view 'Brands' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "72"
  },
  {
    "controlNo": 1382,
    "controlName": "inventory.menu.product-master.view",
    "controlType": "menu",
    "descr": "Can view 'Product Master' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "73"
  },
  {
    "controlNo": 1383,
    "controlName": "inventory.menu.opening-stock.view",
    "controlType": "menu",
    "descr": "Can view 'Opening Stock' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "74"
  },
  {
    "controlNo": 1384,
    "controlName": "inventory.menu.reports.view",
    "controlType": "menu",
    "descr": "Can view 'Reports' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "75"
  },
  {
    "controlNo": 1385,
    "controlName": "inventory.menu.stock-journal.view",
    "controlType": "menu",
    "descr": "Can view 'Stock Journal' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "76"
  },
  {
    "controlNo": 1386,
    "controlName": "inventory.menu.branch-transfer.view",
    "controlType": "menu",
    "descr": "Can view 'Branch Transfer' child menu item in sidebar",
    "menuType": "accounts",
    "itemType": "child",
    "menuId": "77"
  }
]
