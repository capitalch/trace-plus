import clsx from "clsx"
import { ChangeEvent } from "react"

export function CompGenericSwitch({
    customData,
    defaultChecked,
    disabled,
    onChange,
}: CompGenericSwitchType) {
    return (
        <label className={clsx("inline-flex items-center cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
            <input
                type="checkbox"
                defaultChecked={defaultChecked}
                disabled={disabled}
                onChange={onChange ? (event: ChangeEvent<HTMLInputElement>) => onChange(event, customData) : undefined}
                className="sr-only peer"
                aria-label="Toggle switch"
            />
            <div
                className={clsx(
                    "relative w-11 h-6 rounded-full transition-all",
                    "peer-checked:bg-blue-600 bg-primary-200",
                    disabled ? "bg-gray-300" : "",
                    "after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:transition-all",
                    "peer-checked:after:translate-x-full",
                    disabled
                        ? "after:bg-gray-400 after:border-gray-500"
                        : "after:bg-white after:border-gray-300",
                    "after:border after:content-['']"
                )}>
                </div>
        </label>
    )
}

export type CompGenericSwitchType = {
    customData?: any
    defaultChecked?: boolean
    disabled: boolean
    onChange?: (event: ChangeEvent<HTMLInputElement>, customData?: any) => void
}