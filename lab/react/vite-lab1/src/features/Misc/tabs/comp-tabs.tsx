import clsx from "clsx";
import React, { useState } from "react"

export function CompTabs({ tabsInfo, className }: { tabsInfo: CompTabsType, className?: string }) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    // ripple bg-blue-500 text-white 
    const ripple = 'relative overflow-hidden  px-4 py-2 rounded-md shadow-md transition-all duration-300  active:scale-95 group '
    const spanRipple = 'absolute inset-0 bg-white opacity-30 scale-0 group-active:scale-200 transition-transform duration-500 rounded-lg'

    return (
        <div className={className}>
            <div className="flex space-x-2 border-b border-gray-300 pb-0.5">
                {
                    tabsInfo.map((tab: TabType, idx: number) => {
                        return (
                            <button key={idx}
                                className={clsx(ripple, 'py-2 px-8 rounded-md  border-b-3 transition-colors duration-300'
                                    , (idx === activeTabIndex)
                                        ? 'border-teal-500 bg-primary-500 text-white font-semibold'
                                        : 'border-white hover:border-teal-100 bg-neutral-200 hover:bg-primary-300 text-gray-400 hover:text-gray-700')}
                                onClick={() => setActiveTabIndex(idx)}>
                                {tab.label}
                                <span className={spanRipple}></span>
                            </button>
                        )
                    })
                }
            </div>
            <div className="py-4">
                {tabsInfo[activeTabIndex].content}
            </div>
        </div>
    )
}

export type CompTabsType = TabType[]

type TabType = {
    label: string
    content: React.ReactElement
}