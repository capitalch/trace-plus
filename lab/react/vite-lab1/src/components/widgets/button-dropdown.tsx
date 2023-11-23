import { UserIcon } from "../icons/user-icon"
import { SignalsStore } from "../../app/signals-store"

function ButtonDropdown({ children }: { children: any }) {
    const toShowDropdownMenu: boolean = SignalsStore.layouts.navbar.toShowDropdownMenu.value

    return (<div >
        <span
            className="inline-flex items-center py-2 pl-4 pr-6 hover:cursor-pointer text-gray-100 bg-primary-500 border-primary-400 hover:bg-primary-600 hover:text-white"
            onClick={(e:any) => {
                e.stopPropagation()
                SignalsStore.layouts.navbar.toShowDropdownMenu.value = !SignalsStore.layouts.navbar.toShowDropdownMenu.value
            }}>
            <UserIcon className='w-5 h-5' />
            <svg className="w-3 h-3 ml-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
            </svg>
        </span>

        {toShowDropdownMenu && (
            children
        )}

    </div>)


}
export { ButtonDropdown }