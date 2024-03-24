import clsx from "clsx";
import ClickAwayListener from "react-click-away-listener"
import { UserIcon } from "../../../components/icons/user-icon";
import { LogoutIcon } from "../../../components/icons/logout-icon";
// import { useState } from "react";
import { ChangeUidIcon } from "../../../components/icons/change-uid-icon";
import { ChangePasswordIcon } from "../../../components/icons/change-password-icon";
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon";
import { useDispatch, useSelector } from "react-redux";
import { setShowNavBarDropDownR, showNavBarDropDownFn } from "../layouts-slice";
import { AppDispatchType, } from "../../../app/store/store";
import { doLogoutR } from "../../login/login-slice";
import { useNavigate } from "react-router-dom";

export function LogoutMenuButton({ className }: { className?: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()

    const toShowNavBarDropDownSelector: boolean = useSelector(showNavBarDropDownFn)
    return (
        // <div>
        <ClickAwayListener onClickAway={handleOnClickAway} >
            <div>
                <button onClick={handleShowDropdown}
                    className={clsx(className, 'flex px-4 gap-3 py-2 text-gray-200 hover:text-white hover:bg-primary-700 hover:cursor-pointer active:bg-primary-400')}>
                    <UserIcon />
                    <CheveronDownIcon />
                </button>


                {toShowNavBarDropDownSelector &&
                    <div className="absolute z-10 mt-2 rounded-md shadow-lg bg-gray-50 right-0 border-[1px] text-gray-500 font-semibold">
                        <div className="" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button onClick={handleOnChangeUid} className="border-b-[1px] h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                                <ChangeUidIcon className='w-4 h-4 my-2 text-blue-500' />
                                <span className="text-secondary-500">Change uid</span>
                            </button>
                            <button onClick={handleOnChangePassword} className="border-b-[1px] h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                                <ChangePasswordIcon className='w-4 h-4 my-2 text-red-700' />
                                <span>Change password</span>
                            </button>
                            <button onClick={handleOnLogout} className=" h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                                <LogoutIcon className='w-4 h-4 my-2 text-green-500' />
                                <span>Log out</span>
                            </button>
                        </div>
                    </div>
                }
            </div>
        </ClickAwayListener>
        // </div>
    )

    function handleOnChangeUid() {
        navigate('/change-uid')
    }
    function handleOnChangePassword() {
        navigate('/change-password')
    }
    function handleOnClickAway(e: any) {
        console.log(e)
        dispatch(setShowNavBarDropDownR({ toShowNavBarDropDown: false }))
    }
    function handleOnLogout() {
        dispatch(doLogoutR())
    }
    function handleShowDropdown() {
        dispatch(setShowNavBarDropDownR({ toShowNavBarDropDown: !toShowNavBarDropDownSelector }))
    }
}