// import { SpinnerIcon } from "../icons/spinner-icon";
import {TwoSeventyRing} from 'react-svg-spinners'

export function LoadingIndicator() {
    return (
        <div className="m-auto">
            {/* <SpinnerIcon className="w-12 h-12 text-primary-500" /> */}
            <TwoSeventyRing color="#7c3aed" width={45} height={45} />
        </div>
    )
}