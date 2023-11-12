import { useState } from "react"
import { MenuFold } from "../icons/menu-fold"

function ButtonDropdown1() {

    const [isOpen, setIsOpen] = useState(false)

    return (<div className="relative inline-block text-left">
        <button
            type="button"
            className="inline-flex justify-center w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            onClick={() => setIsOpen(!isOpen)}>
            More
        </button>

        {isOpen && (
            <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-gray-50 right-0 border-[1px]">
                <div className="divide-y divide-primary-100" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <span className="flex items-center text-sm cursor-pointer hover:bg-gray-200">
                        <MenuFold className='w-4 h-4 mx-4 my-2 text-red-500' />
                        <label>Menu items</label>
                    </span>
                    <a href="/account-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Account settings</a>
                    <a href="/documentation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Documentation</a>
                    <a href="/documentation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Change UID</a>
                    <a href="/documentation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Change password</a>
                    {/* <span className="block px-4 py-2 text-sm text-gray-700 opacity-50" role="menuitem">Invite a friend (coming soon!)</span> */}
                </div>
            </div>
        )}

    </div>)
}
export { ButtonDropdown1 }