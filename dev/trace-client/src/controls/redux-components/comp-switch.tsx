import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../app/store";
import { setCompSwitchState, selectCompSwitchStateFn } from "./comp-slice";
import clsx from "clsx";
import { ChangeEvent } from "react";

export function CompSwitch({
  className,
  instance,
  isDisabled = false,
  leftLabel,
  rightLabel,
  toToggleLeftLabel = false
}: CompSwitchType) {
  const dispatch: AppDispatchType = useDispatch();
  const isChecked: boolean = useSelector((state: RootStateType) => {
    return selectCompSwitchStateFn(state, instance);
  });

  return (
    // help by ai
    <label
      className={clsx(
        "inline-flex items-center cursor-pointer",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="mr-2 font-medium text-gray-500 text-md">
        {evaluateLeftLabel()}
      </span>
      <input
        type="checkbox"
        disabled={isDisabled}
        checked={isChecked || false}
        className="sr-only peer"
        onChange={handleOnChangeSwitch}
      />
      <div
        className={clsx(
          "relative w-11 h-6 rounded-full transition-all",
          "peer-checked:bg-blue-600 bg-primary-200",
          isDisabled ? "bg-gray-300" : "",
          "after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:transition-all",
          "peer-checked:after:translate-x-full",
          isDisabled
            ? "after:bg-gray-400 after:border-gray-500"
            : "after:bg-white after:border-gray-300",
          "after:border after:content-['']"
        )}
      ></div>
      <span
        className={clsx(
          "ml-2 text-md font-medium",
          isDisabled ? "text-gray-400" : "text-gray-600"
        )}
      >
        {toToggleLeftLabel ? "" : rightLabel}
      </span>
    </label>
  );

  async function handleOnChangeSwitch(event: ChangeEvent<HTMLInputElement>) {
    const isChecked: boolean = event.target.checked;
    dispatch(
      setCompSwitchState({
        instance: instance,
        switchState: isChecked
      })
    );
  }

  function evaluateLeftLabel() {
    if (toToggleLeftLabel) {
      if (isChecked) {
        return rightLabel;
      } else {
        return leftLabel;
      }
    } else {
      return leftLabel;
    }
  }
}

type CompSwitchType = {
  className?: string;
  instance: string;
  isDisabled?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  toToggleLeftLabel?: boolean;
};
