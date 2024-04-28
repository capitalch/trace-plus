import { SpinnerIcon } from "../icons/spinner-icon";

export function LoadingIndicator() {
    return (
        <div className="m-auto">
            <SpinnerIcon className="w-12 h-12 text-primary-500" />
        </div>
    )
}