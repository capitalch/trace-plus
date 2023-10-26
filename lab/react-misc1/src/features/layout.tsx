import { useState } from "react"
import { SignalsStore } from "../app/signals-store"
import { useMediaQuery } from "react-responsive"

function Layout() {
    const [, setRefresh] = useState({})
    const isBigScreen = useMediaQuery({ query: '(min-width: 1536px)' })
    if(isBigScreen) {
        SignalsStore.main.isSideBar.value = true
    } else {
        SignalsStore.main.isSideBar.value = false
    }
    const isSidBar =  SignalsStore.main.isSideBar.value
    let cls = isSidBar ? 'block': 'hidden'
    // const cls: string = SignalsStore.main.isSideBar.value ? 'block' : 'hidden'
    // const cls: string = isBigScreen ? 'block' : 'hidden'
    // if(isBigScreen){
    //     if(isSidBar){
    //         cls = 'block'
    //     } else {
    //         cls = 'hidden'
    //     }
    // } else {
    //     if(isSidBar){
    //         cls = 'block'
    //     } else {
    //         cls = 'hidden'
    //     }
    // }
    // if(isBigScreen || ){
    //     cls = 'block'
    // } else{
    //     cls = 'hidden'
    // }
    
    return (
        <div className="prose">
            {/* Container screen width and height */}
            <div className="flex bg-red-500 h-[100vh] w-[100vw]">
                {/* Side bar */}
                <div className={cls}>
                    {/* <div className="hidden h-full bg-yellow-100  2xl:w-[200px] 2xl:flex 2xl:flex-col"> */}
                    <div className="h-full bg-yellow-100  w-[200px] flex flex-col">
                        <div className="flex items-center justify-between w-full h-10">
                            <div className="bg-red-400 w-min h-min">TRACE</div>
                            <button onClick={handleHide} className="bg-gray-400 h-min">Coll</button>
                        </div>
                    </div>
                </div>
                {/* navbar and content container */}
                <div className="flex flex-col w-full">
                    {/* navbar */}
                    <div className="flex items-center h-10 bg-slate-500">
                        <button onClick={handleToggleSideBar} className="ml-2 2xl:hidden">Menu</button>
                        <div className="ml-3 text-white">Header</div>
                    </div>
                    {/* Content */}
                    <div className="h-full bg-stone-300"></div>
                </div>
            </div>
        </div>
    )

    function handleHide() {
        SignalsStore.main.isSideBar.value = false
    }

    function handleToggleSideBar(){
        SignalsStore.main.isSideBar.value = true
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