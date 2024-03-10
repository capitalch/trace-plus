import clsx from "clsx";
import { UserIcon } from "../../../components/icons/user-icon";
import { LogoutIcon } from "../../../components/icons/logout-icon";
import { useState } from "react";
import { ChangeUidIcon } from "../../../components/icons/change-uid-icon";
import { ChangePasswordIcon } from "../../../components/icons/change-password-icon";
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon";

export function LogoutMenuButton({ className }: { className?: string }) {
    const [isShowDropdown, showDropDown] = useState(false)
    return (
        <div>
            <button onClick={handleShowDropdown}
                className={clsx(className, 'flex px-4 gap-3 py-2 text-gray-200 hover:text-white hover:bg-primary-700 hover:cursor-pointer active:bg-primary-400')}>
                <UserIcon />
                <CheveronDownIcon />

            </button>
            {isShowDropdown &&
                <div className="absolute z-10 mt-2 rounded-md shadow-lg bg-gray-50 right-0 border-[1px] text-gray-500 font-semibold">
                    <div className="" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button onClick={handleOnClickLogout} className="border-b-[1px] h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                            <ChangeUidIcon className='w-4 h-4 my-2 text-primary-500' />
                            <span className="text-secondary-500">Change uid</span>
                        </button>
                        <button onClick={handleOnClickLogout} className="border-b-[1px] h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                            <ChangePasswordIcon className='w-4 h-4 my-2 text-red-700' />
                            <span>Change password</span>
                        </button>
                        <button onClick={handleOnClickLogout} className=" h-10 px-4 gap-4 w-full flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                            <LogoutIcon className='w-4 h-4 my-2 text-secondary-700' />
                            <span>Log out</span>
                        </button>

                    </div>
                </div>
            }
        </div>
    )

    function handleOnClickLogout() {

    }
    function handleShowDropdown() {
        showDropDown(!isShowDropdown)
    }
}