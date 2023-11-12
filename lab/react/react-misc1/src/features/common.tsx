import { useEffect, useRef, useState } from "react"
import { Button } from "../components/controls/buttons"
import clsx from "clsx"
import { ButtonDropdown1 } from "../components/controls/button-dropdown1"
import { useSignal } from "@preact/signals-react"
import { Modal } from "./modal"
import { useNavigate } from "react-router-dom"
function Common() {
    const meta: any = {
        toggleClass: useSignal('h-max scale-y-1')
    }
    const navigate = useNavigate()
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-4 m-10">
                <button className="bg-primary-400"  >Primary</button>
                <button className="px-3 py-1 mb-1 mr-1 text-xs font-bold text-pink-500 uppercase transition-all duration-150 ease-linear outline-none hover:underline background-transparent focus:outline-none" type="button">
                    Forgot password</button>
                <ButtonDropdown1 />
                <button onClick={handleTransition} className="px-2 rounded-md bg-slate-200">Transition</button>
            </div>
            <div>
                <div className={''}>
                    <div className={clsx("flex flex-col origin-top  bg-slate-400 overflow-hidden", 'transition-all duration-1000 ease-in-out', meta.toggleClass.value)}>
                        <span>Level1</span>
                        <span>level2</span>
                        <span>level3</span>
                        <span>level4</span>
                    </div>

                    <div className={clsx("flex flex-col bg-slate-200",'')}>
                        <span>Level1</span>
                        <span>level2</span>
                        <span>level3</span>
                        <span>level4</span>
                    </div>

                </div>
            </div>
            <Modal />

        </div>
    )

    function handleTransition() {
        if (meta.toggleClass.value === 'h-max scale-y-1') {
            meta.toggleClass.value = 'h-0 scale-y-0'
        } else {
            meta.toggleClass.value = 'h-max scale-y-1'
        }
    }

    // function handleTransition() {
    //     if (meta.toggleClass.value === 'scale-y-1') {
    //         meta.toggleClass.value = 'scale-y-0'
    //     } else {
    //         meta.toggleClass.value = 'scale-y-1'
    //     }
    // }

}
export { Common }