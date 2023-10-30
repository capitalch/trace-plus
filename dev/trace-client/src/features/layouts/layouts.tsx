import { useState } from "react"
import { useMediaQuery } from "react-responsive"
import { Outlet } from "react-router-dom"
import { SignalsStore } from "../../app/signals-store"
import { MenuFold } from "../../components/icons/menu-fold"
import MenuUnfold from "../../components/icons/menu-unfold"
import clsx from "clsx"
import { ButtonDropdown } from "../../components/widgets/button-dropdown"
// import { Navbar } from "./navbar"

function Layouts() {
    const [, setRefresh] = useState({})
    const isBigScreen = useMediaQuery({ query: '(min-width: 1536px)' })
    let cls = ''
    if (isBigScreen) {
        cls = 'block'
    } else {
        cls = 'hidden'
    }

    if (SignalsStore.layouts.hideSideBarClicked) {
        SignalsStore.layouts.hideSideBarClicked = false
        cls = 'hidden'
    }

    if (SignalsStore.layouts.showSidBarClicked) {
        SignalsStore.layouts.showSidBarClicked = false
        cls = 'block'
    }

    return (
        <div className="prose">
            {/* Container full screen width and height */}
            <div className="flex h-[100vh] w-[100vw]">
                {/* Side bar */}
                <div className={cls}>
                    <div className="h-full bg-opacity-60 bg-neutral-50  w-[200px] flex flex-col">
                        {/* SideBar Header */}
                        <div className="flex items-center h-10 justify-evenly w-max">
                            <img src="trace-logo.png" />
                            <span onClick={handleHideSideBar}
                                className="ml-6 bg-transparent rounded-lg cursor-pointer text-primary-500 hover:bg-primary-100 hover:ring-1 hover:ring-primary-200">
                                <MenuFold />
                            </span>
                        </div>
                    </div>
                </div>
                {/* navbar and content container */}
                <div className="flex flex-col w-full">
                    {/* navbar */}
                    {/* <Navbar /> */}
                    <div className="flex items-center justify-between h-10 bg-primary-500">
                        <div className="flex items-center">
                            <span onClick={handleShowSideBar} className={clsx(((cls === 'block') ? 'hidden' : 'block'),
                                'text-white ml-2 bg-transparent cursor-pointer hover:bg-primary-600  hover:ring-white hover:ring-1 rounded-lg'
                            )}>
                                <MenuUnfold />
                            </span>
                            <div className="ml-3 text-sm text-white">Header</div>
                        </div>
                        <ButtonDropdown>Drop down list view</ButtonDropdown>
                    </div>
                    {/* Content */}
                    <div className="h-full bg-white">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )

    function handleHideSideBar() {
        SignalsStore.layouts.hideSideBarClicked = true
        setRefresh({})
    }

    function handleShowSideBar() {
        SignalsStore.layouts.showSidBarClicked = true
        setRefresh({})
    }
}

export { Layouts }