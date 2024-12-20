import { useDispatch, useSelector } from "react-redux"
import { AppDispatchType, RootStateType } from "../../app/store/store"
import { setCompSwitchState, selectCompSwitchStateFn } from "./comp-slice"
import clsx from "clsx"

export function CompSwitch({
    className,
    instance,
    leftLabel,
    rightLabel
}: CompSwitchType) {
    const dispatch: AppDispatchType = useDispatch()
    const isChecked: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance)) || false
    return (
        <label className={clsx("inline-flex cursor-pointer items-center", className)}>
            <span className="mr-2 text-md font-medium text-gray-500">{leftLabel}</span>
            <input type="checkbox" checked={isChecked} className="peer sr-only" onChange={handleOnChangeSwitch} />
            <div className="peer relative h-6 w-11 rounded-full bg-primary-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] hover:bg-slate-500 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:peer-focus:ring-blue-800"></div>
            <span className="ml-2 text-md font-medium text-gray-600">{rightLabel}</span>
        </label>
    )

    function handleOnChangeSwitch(e: any) {
        dispatch(setCompSwitchState({
            instance: instance,
            switchState: e.target?.checked
        }))
    }
}

type CompSwitchType = {
    className?: string
    instance: string
    leftLabel?: string
    rightLabel?: string
}