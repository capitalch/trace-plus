import clsx from "clsx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../app/store";
import { setActiveTabIndex } from "../redux-components/comp-slice";
import { CompTabsType } from "../redux-components/comp-tabs";

export function WidgetTabToggleButtons({
    instance,
    tabsInfo,
    className
}: WidgetTabToggleButtonsProps) {
    const dispatch: AppDispatchType = useDispatch();
    const compTabsInstance = useSelector(
        (state: RootStateType) => state.reduxComp.compTabs[instance]
    );

    useEffect(() => {
        if (compTabsInstance?.activeTabIndex === undefined) {
            dispatch(
                setActiveTabIndex({
                    instance: instance,
                    activeTabIndex: 0
                })
            );
        }
    }, [dispatch, instance, compTabsInstance?.activeTabIndex]);

    const activeTabIndex = compTabsInstance?.activeTabIndex ?? 0;

    return (
        <div className={clsx("inline-flex rounded-lg border-2 border-slate-300 overflow-hidden shadow-sm", className)}>
            {tabsInfo.map((tab, idx) => {
                const isActive = idx === activeTabIndex;
                const isFirst = idx === 0;

                return (
                    <div key={idx} className="flex items-center">
                        {!isFirst && (
                            <div className="w-px bg-slate-300 h-6" />
                        )}
                        <button
                            type="button"
                            onClick={() =>
                                dispatch(
                                    setActiveTabIndex({
                                        instance: instance,
                                        activeTabIndex: idx
                                    })
                                )
                            }
                            className={clsx(
                                "px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                            )}
                        >
                            {tab.label}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

type WidgetTabToggleButtonsProps = {
    instance: string;
    tabsInfo: CompTabsType;
    className?: string;
};
