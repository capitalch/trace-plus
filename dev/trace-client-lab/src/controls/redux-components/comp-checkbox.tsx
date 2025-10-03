import { useDispatch, useSelector } from "react-redux"
import { AppDispatchType, RootStateType } from "../../app/store"
import clsx from "clsx"
import { ChangeEvent } from "react"
import { selectCompCheckBoxStateFn, setCompCheckBoxState } from "./comp-slice"

export function CompCheckBox({
    className,
    instance,
    label
}: CompCheckBoxType) {
    const dispatch: AppDispatchType = useDispatch()
    const isChecked: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, instance)) || false

    return (<label className={clsx("inline-flex cursor-pointer items-center", className)}>
        <span className="mr-2 font-medium text-gray-500 text-md">{label}</span>
        <input type="checkbox" checked={isChecked} className="cursor-pointer" onChange={handleOnChangeCheckBox} />
    </label>)

    function handleOnChangeCheckBox(e: ChangeEvent<HTMLInputElement>) {
        dispatch(setCompCheckBoxState({
            instance: instance,
            checkBoxState: e.target?.checked
        }))
    }
}

type CompCheckBoxType = {
    className?: string
    instance: string
    label: string
    // isChecked: boolean
}