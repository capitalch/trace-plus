import clsx from "clsx";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../app/store";
import { setActiveTabIndex } from "./comp-slice";
import { IconError1 } from "../icons/icon-error1";

export function CompTabs({
  className,
  instance,
  tabsInfo
}: {
  className?: string;
  instance: string;
  tabsInfo: CompTabsType;
}) {
  const dispatch: AppDispatchType = useDispatch();
  const ripple =
    "px-8 py-2 rounded-md shadow-md transition-all duration-300 active:scale-95 group ";
  const spanRipple =
    "inset-0 bg-white opacity-30 scale-0 group-active:scale-200 transition-transform duration-500 ";
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
      )
    }
  }, [dispatch, instance, compTabsInstance?.activeTabIndex])

  return (
    <div className={className}>
      <div className="flex space-x-2 border-b border-gray-300 pb-0.5">
        {tabsInfo.map((tab: TabType, idx: number) => {
          const isActive = idx === (compTabsInstance?.activeTabIndex ?? 0);
          return (
            <button
              key={idx}
              type="button"
              className={clsx(
                ripple,
                "flex flex-col items-center justify-center rounded-t-lg border-b-3 transition-colors duration-300 w-32 min-w-fit",
                isActive
                  ? "border-teal-500 bg-blue-500 text-white font-semibold"
                  : "border-white hover:border-teal-100 bg-neutral-200 hover:bg-primary-200 text-gray-400 hover:text-gray-700"
              )}
              onClick={() =>
                dispatch(
                  setActiveTabIndex({
                    instance: instance,
                    activeTabIndex: idx
                  })
                )
              }
            >
              <div className="flex items-center gap-2">
                {tab.hasError && (
                  <IconError1 className="text-red-500 w-5 h-5" />
                )}
                <span className="text-sm">{tab.label}</span>
              </div>
              {tab.tagLine && (
                <span className="text-[11px] mt-0.5 text-gray-200 group-hover:text-white leading-tight">
                  {tab.tagLine}
                </span>
              )}
              <span className={spanRipple}></span>
            </button>
          );
        })}
      </div>
      <div className="py-4">
        {tabsInfo[compTabsInstance?.activeTabIndex || 0].content}
      </div>
    </div>
  );
}

export type CompTabsType = TabType[];

type TabType = {
  label: string;
  content: React.ReactElement;
  hasError?: boolean;
  tagLine?: string;
};
