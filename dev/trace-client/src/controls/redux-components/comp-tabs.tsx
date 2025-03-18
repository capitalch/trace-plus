import clsx from "clsx";
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../app/store/store";
import { setActiveTabIndex } from "./comp-slice";

export function CompTabs(
    {
        className,
        instance,
        tabsInfo,
    }: { className?: string, instance: string, tabsInfo: CompTabsType, }) {
    const dispatch: AppDispatchType = useDispatch()
    const ripple = 'relative overflow-hidden px-8 py-2 rounded-md shadow-md transition-all duration-300 active:scale-95 group '
    const spanRipple = 'absolute inset-0 bg-white opacity-30 scale-0 group-active:scale-200 transition-transform duration-500 '
    const compTabsInstance = useSelector((state: RootStateType) => state.reduxComp.compTabs[instance])

    return (
        <div className={className}>
            <div className="flex space-x-2 border-b border-gray-300 pb-0.5">
                {
                    tabsInfo.map((tab: TabType, idx: number) => {
                        return (
                            <button key={idx}
                                className={clsx(ripple, 'py-2 px-8 rounded-md border-b-3   transition-colors duration-300'
                                    , (idx === (compTabsInstance?.activeTabIndex ?? 0))
                                        ? 'border-teal-500 bg-primary-500 text-white font-semibold '
                                        : 'border-white hover:border-teal-100 bg-neutral-200 hover:bg-primary-200 text-gray-400 hover:text-gray-700')}
                                onClick={() => dispatch(setActiveTabIndex({
                                    instance: instance,
                                    activeTabIndex: idx
                                }))}>
                                {tab.label}
                                <span className={spanRipple}></span>
                            </button>
                        )
                    })
                }
            </div>
            <div className="py-4">
                {tabsInfo[compTabsInstance?.activeTabIndex || 0].content}
            </div>
        </div>
    )
}

export type CompTabsType = TabType[]

type TabType = {
    label: string
    content: React.ReactElement
}