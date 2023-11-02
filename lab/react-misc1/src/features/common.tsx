import { useEffect, useRef, useState } from "react"
import { Button } from "../components/controls/buttons"
import clsx from "clsx"
import { ButtonDropdown1 } from "../components/controls/button-dropdown1"

function Common() {
    const x:string = "large"
    return (<div className="flex gap-4 m-10 items-center">
        <button className="bg-primary-400"  >Primary</button>
        <button className="px-3 py-1 mb-1 mr-1 text-xs font-bold text-pink-500 uppercase transition-all duration-150 ease-linear outline-none hover:underline background-transparent focus:outline-none" type="button">
            Forgot password</button>
        <ButtonDropdown1 />
        <span data-size="large" className={`data-[size=${x}]:bg-red-500 p-2`}>Check</span>
    </div>)


}
export { Common }