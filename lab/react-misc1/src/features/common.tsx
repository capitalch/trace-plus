import { useEffect, useRef, useState } from "react"
import { Button } from "../components/controls/buttons"
import clsx from "clsx"
import { ButtonDropdown } from "../components/controls/button-dropdown"
import { ButtonDropdown1 } from "../components/controls/button-dropdown1"

function Common() {

    return (<div className="flex gap-4 m-10">
        <button className="bg-primary-400"  >Primary</button>
        <button className="px-3 py-1 mb-1 mr-1 text-xs font-bold text-pink-500 uppercase transition-all duration-150 ease-linear outline-none hover:underline background-transparent focus:outline-none" type="button">
            Forgot password</button>
        <ButtonDropdown />
        <ButtonDropdown1 />
    </div>)


}
export { Common }