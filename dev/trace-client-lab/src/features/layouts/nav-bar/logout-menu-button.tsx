import clsx from "clsx";
import ClickAwayListener from "react-click-away-listener"
import { useDispatch, useSelector } from "react-redux";
import { setShowNavBarDropDown, showNavBarDropDownFn } from "../layouts-slice";
import { AppDispatchType, RootStateType, } from "../../../app/store";
import { doLogout, LoginType, UserDetailsType } from "../../login/login-slice";
import { ChangeUid } from "./change-uid";
import { ChangePassword } from "./change-password";
import { Utils } from "../../../utils/utils";
import { IconCheveronDown } from "../../../controls/icons/icon-cheveron-down";
import { IconChangeUid } from "../../../controls/icons/icon-change-uid";
import { IconChangePassword } from "../../../controls/icons/icon-change-password";
import { IconLogout } from "../../../controls/icons/icon-logout";
import { UserTypesEnum } from "../../../utils/global-types-interfaces-enums";
import { IconUser1 } from "../../../controls/icons/icon-user1";
import { GlobalContext, GlobalContextType, resetGlobalContext } from "../../../app/global-context";
import { useContext } from "react";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

export function LogoutMenuButton({ className }: { className?: string }) {
    const context: GlobalContextType = useContext(GlobalContext);
    const dispatch: AppDispatchType = useDispatch()
    const toShowNavBarDropDownSelector: boolean = useSelector(showNavBarDropDownFn)
    const reduxState: RootStateType = Utils.getReduxState()
    const userType: string | undefined = reduxState.login.userDetails?.userType
    const isNotSuperAdmin = !(userType === UserTypesEnum.SuperAdmin)
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const email: string | undefined = loginInfo.userDetails?.userEmail
    return (
        <ClickAwayListener onClickAway={handleOnClickAway}>
            <div className="ml-auto  text-white bg-primary-500 flex items-center relative h-12">
                <TooltipComponent content={getLogoutTooltipContent()} position="LeftCenter">
                    <button onClick={handleShowDropdown} type="button"
                        className={clsx(className, 'flex px-4 gap-3 py-2 text-gray-200 hover:text-white hover:bg-primary-700 hover:cursor-pointer active:bg-primary-400')}>
                        <span className="text-sm">{email}</span>
                        <IconUser1 className='w-4 h-5 text-secondary-200' />
                        <IconCheveronDown />
                    </button>
                    {
                        toShowNavBarDropDownSelector &&
                        <div className="absolute z-10 mt-2 rounded-md shadow-lg bg-gray-50 right-0 border-[1px] text-gray-500 font-semibold">
                            <div className="" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                {isNotSuperAdmin && <button type="button" onClick={handleOnChangeUid} className="border-b-[1px] h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                                    <IconChangeUid className='w-4 h-4 my-2 text-blue-500' />
                                    <span className="text-secondary-500">Change uid</span>
                                </button>}
                                {isNotSuperAdmin && <button onClick={handleOnChangePassword} className="border-b-[1px] h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                                    <IconChangePassword className='w-4 h-4 my-2 text-red-700' />
                                    <span>Change password</span>
                                </button>}
                                <button onClick={handleOnLogout} type="button" className=" h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                                    <IconLogout className='w-4 h-4 my-2 text-green-500' />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    }
                </TooltipComponent>
            </div>
         </ClickAwayListener>
    )

    function getLogoutTooltipContent(): string {
        const loginInfo: LoginType = Utils.getCurrentLoginInfo()
        const userDetails: UserDetailsType | undefined = loginInfo.userDetails
        const clientName: string = userDetails?.clientName || ''
        const userName: string = userDetails?.userName || ''
        const userType: string = userDetails?.userType || ''

        return(`Client: ${clientName}, User: ${userName}, User type: ${getUserTypeName()}`)

        function getUserTypeName(){
            let ret = ''
            if(userType===UserTypesEnum.Admin){
                ret = 'Admin'
            } else if(userType===UserTypesEnum.BusinessUser){
                ret = 'Business user'
            } else {
                ret = 'Super admin'
            }
            return(ret)
        }
    }

    function handleOnChangeUid() {
        Utils.showHideModalDialogA({
            title: 'Change UID',
            element: <ChangeUid />,
            isOpen: true
        })
    }

    function handleOnChangePassword() {
        Utils.showHideModalDialogA({
            title: 'Change password',
            element: <ChangePassword />,
            isOpen: true
        })
    }
    function handleOnClickAway() {
        dispatch(setShowNavBarDropDown({ toShowNavBarDropDown: false }))
    }
    function handleOnLogout() {
        handleOnClickAway() // Otherwise the menu remains open
        resetGlobalContext(context)
        dispatch(doLogout())
    }
    function handleShowDropdown() {
        dispatch(setShowNavBarDropDown({ toShowNavBarDropDown: !toShowNavBarDropDownSelector }))
    }
}