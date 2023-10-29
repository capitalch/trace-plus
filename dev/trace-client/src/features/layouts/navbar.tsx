import clsx from "clsx"
import MenuUnfold from "../../components/icons/menu-unfold"
import { useState } from "react"
import { useMediaQuery } from "react-responsive"
import { SignalsStore } from "../../app/signals-store"

function Navbar() {

    const [, setRefresh] = useState({})
    const isBigScreen = useMediaQuery({ query: '(min-width: 1536px)' })
    let cls = ''
    if (isBigScreen) {
        cls = 'block'
    } else {
        cls = 'hidden'
    }

    if (SignalsStore.main.hideSideBarClicked) {
        SignalsStore.main.hideSideBarClicked = false
        cls = 'hidden'
    }

    if (SignalsStore.main.showSidBarClicked) {
        SignalsStore.main.showSidBarClicked = false
        cls = 'block'
    }

    return (
        <div className="flex items-center h-10 bg-primary-500">
            <span onClick={handleShowSideBar} className={clsx(((cls === 'block') ? 'hidden' : 'block'),
                'text-white ml-2 bg-transparent cursor-pointer hover:bg-primary-600  hover:ring-white hover:ring-1 rounded-lg'
            )}>
                <MenuUnfold />
            </span>
            <div className="ml-3 text-sm text-white">Header</div>
        </div>
    )

    function handleShowSideBar() {
        SignalsStore.main.showSidBarClicked = true
        setRefresh({})
    }
}
export { Navbar }