import { useState } from "react"
import { SignalsStore } from "../app/signals-store"
import { useMediaQuery } from "react-responsive"
import { Outlet } from "react-router-dom"

function Layout() {
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
        <div className="prose">
            {/* Container full screen width and height */}
            <div className="flex bg-red-500 h-[100vh] w-[100vw]">
                {/* Side bar */}
                <div className={cls}>
                    <div className="h-full bg-yellow-100  w-[200px] flex flex-col">
                        <div className="flex items-center justify-between w-full h-10">
                            <div className="bg-red-400 w-min h-min">TRACE</div>
                            <button onClick={handleHideSideBar} className="bg-gray-400 h-min animate-none">Hide</button>
                        </div>
                    </div>
                </div>
                {/* navbar and content container */}
                <div className="flex flex-col w-full">
                    {/* navbar */}
                    <div className="flex items-center h-10 bg-slate-500">
                        <button onClick={handleShowSideBar} className={(cls === 'block') ? 'hidden' : 'block'}>Show</button>
                        <div className="ml-3 text-white">Header</div>
                    </div>
                    {/* Content */}
                    <div className="h-full bg-stone-300">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )

    function handleHideSideBar() {
        SignalsStore.main.hideSideBarClicked = true;
        setRefresh({})
    }

    function handleShowSideBar() {
        SignalsStore.main.showSidBarClicked = true
        setRefresh({})
    }
}
export { Layout }

// {/* <div className="prose">
//     {/* Container screen width and height */}
//     <div className="flex bg-red-500 h-[100vh] w-[100vw]">
//         {/* Side bar */}
//         <div className="hidden  h-full bg-yellow-100  2xl:w-[200px] 2xl:flex 2xl:flex-col">
//             <div className="flex items-center justify-between w-full h-10">
//                 <div className="bg-red-400 w-min h-min">TRACE</div>
//                 <button onClick={handleHide} className="bg-gray-400 h-min">Coll</button>
//             </div>
//         </div>
//         {/* navbar and content container */}
//         <div className="flex flex-col w-full">
//             {/* navbar */}
//             <div className="flex items-center h-10 bg-slate-500">
//                 <div className="ml-3 text-white">Header</div>
//             </div>
//             {/* Content */}
//             <div className="h-full bg-stone-300"></div>
//         </div>
//     </div>
// </div> */}