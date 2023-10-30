import clsx from "clsx"
import { useState } from "react"

function ButtonDropdown({ children }: { children: any }) {
    const [toggleView, setToggleView] = useState(false)
    const cls: string = toggleView ? 'block' : 'hidden'
    return (
        <div>
            <button onClick={handleToggleView} id="dropdownDividerButton" data-dropdown-toggle="dropdownDivider"
                className="text-gray-200 bg-primary-500 hover:text-white  focus:outline-none  font-medium text-sm px-5 py-2.5 text-center inline-flex items-center"
                type="button">{children} <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>

            <div id="dropdownDivider"
                className={clsx(cls, "z-10 origin-top-right right-0 absolute top-11 bg-gray-50 divide-y border-[1px] divide-gray-100 rounded-lg  w-56")}>
                <ul className="text-sm text-gray-700" aria-labelledby="dropdownDividerButton">
                    <li>
                        <span className="block px-4 pb-1 hover:bg-gray-100 ">Dashboard</span>
                    </li>
                    <li>
                        <a href="a.com" className="block px-4 pb-1 hover:bg-gray-100 ">Settings</a>
                    </li>
                    <li>
                        <a href="a.com" className="block px-4 pb-1 hover:bg-gray-100 ">Earnings</a>
                    </li>
                </ul>
                
            </div>

        </div>
    )

    function handleToggleView() {
        setToggleView(!toggleView)
    }
}
export { ButtonDropdown }