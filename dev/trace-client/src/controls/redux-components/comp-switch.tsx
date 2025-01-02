import { useDispatch, useSelector } from "react-redux"
import { AppDispatchType, RootStateType } from "../../app/store/store"
import { setCompSwitchState, selectCompSwitchStateFn } from "./comp-slice"
import clsx from "clsx"
import { ChangeEvent, useEffect } from "react"

export function CompSwitch({
    className,
    customData,
    defaultValue = false,
    instance,
    isDisabled = false,
    leftLabel,
    onChange,
    rightLabel
}: CompSwitchType) {
    const dispatch: AppDispatchType = useDispatch()
    const isChecked: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance)) || false

    useEffect(() => {
        dispatch(setCompSwitchState({ instance: instance, switchState: defaultValue }))
    }, [defaultValue, dispatch, instance])

    return ( // help by ai
        <label
            className={clsx(
                "inline-flex items-center cursor-pointer",
                isDisabled && "opacity-50 cursor-not-allowed",
                className
            )}>
            <span className="mr-2 text-md font-medium text-gray-500">{leftLabel}</span>
            <input
                type="checkbox"
                disabled={isDisabled}
                checked={isChecked}
                className="peer sr-only"
                onChange={handleOnChangeSwitch}
            />
            <div
                className={clsx(
                    "peer relative h-6 w-11 rounded-full transition-all",
                    isDisabled
                        ? "bg-gray-300"
                        : "bg-primary-200 peer-checked:bg-blue-600 hover:bg-slate-500",
                    "after:absolute after:top-[2px] after:start-[2px] after:h-5 after:w-5 after:rounded-full after:transition-all",
                    isDisabled
                        ? "after:bg-gray-400 after:border-gray-500"
                        : "after:bg-white after:border-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white",
                    "after:border after:content-[''] peer-focus:outline-none"
                )}
            ></div>
            <span
                className={clsx(
                    "ml-2 text-md font-medium",
                    isDisabled ? "text-gray-400" : "text-gray-600"
                )}>
                {rightLabel}
            </span>
        </label>
    )

    async function handleOnChangeSwitch(event: ChangeEvent<HTMLInputElement>) {
        const isChecked: boolean = event.target.checked
        if (onChange) {
            const shouldDispatch = await onChange(event, customData) // Wait for the async result
            if (shouldDispatch) {
                dispatch(setCompSwitchState({
                    instance: instance,
                    switchState: isChecked
                }))
            }
        } else {
            dispatch(setCompSwitchState({
                instance: instance,
                switchState: isChecked
            }))
        }
    }
}

type CompSwitchType = {
    className?: string
    customData?: any
    defaultValue?: boolean
    instance: string
    isDisabled?: boolean
    leftLabel?: string
    onChange?: (event: ChangeEvent<HTMLInputElement>, customData?: any) => Promise<boolean> // Updated to return a Promise
    rightLabel?: string
}



// <label className={clsx("inline-flex cursor-pointer items-center", className)}>
//     <span className="mr-2 text-md font-medium text-gray-500">{leftLabel}</span>
//     <input disabled={isDisabled} type="checkbox" checked={isChecked} className="peer sr-only" onChange={handleOnChangeSwitch} />
//     <div className="peer relative h-6 w-11 rounded-full bg-primary-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] hover:bg-slate-500 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:peer-focus:ring-blue-800"></div>
//     <span className="ml-2 text-md font-medium text-gray-600">{rightLabel}</span>
// </label>