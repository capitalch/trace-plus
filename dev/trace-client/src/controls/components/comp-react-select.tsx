import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import _ from "lodash";
import { Utils } from "../../utils/utils";

export function CompReactSelect({
  className,
  getOptions,
  menuPlacement,
  onChange,
  optionLabelName,
  optionValueName,
  placeHolder,
  selectedValue,
  staticOptions,
  // ...otherProps
}: CompReactSelectType) {
  const [options, setOptions] = useState([]);
  const selectRef: any = useRef(null);

  useEffect(() => {
    if (getOptions) {
      getOptions(setOptions);
    }
  }, []);

  useEffect(() => {
    if (!_.isEmpty(options)) {
      selectItem();
    }
  }, [selectedValue]);

  useEffect(() => {
    setOptions(staticOptions ?? []);
  }, [staticOptions]);

  useEffect(() => {
    selectItem();
  }, [options]);

  // Filter out DOM-specific props that shouldn't be passed to react-select
  // const {
  //   name,
  //   onBlur,
  //   ...selectProps
  // } = otherProps;

  return (
    <Select
      className={className}
      getOptionLabel={(option: any) => option[optionLabelName]}
      getOptionValue={(option: any) => option[optionValueName]}
      menuPlacement={menuPlacement || "auto"}
      onChange={onChange}
      options={options}
      ref={selectRef}
      styles={Utils.getReactSelectStyles()}
      placeholder={placeHolder}
    />
  );

  function selectItem() {
    if (!selectRef.current) {
      return;
    }
    if (_.isEmpty(options)) {
      return; // Options not loaded yet. Nothing to match against and nothing to clear
    }
    const selectedOption: any = options.find(
      (option: any) => option[optionValueName] === selectedValue
    );
    if (selectedOption) {
      const currentOption: any = selectRef.current.getValue()?.[0];
      if (currentOption?.[optionValueName] !== selectedValue) {
        selectRef.current.setValue(selectedOption); // Fires onChange only on a real change
      }
    } else if (selectRef.current.hasValue()) {
      selectRef.current.clearValue(); // Clear the stale displayed value
    }
  }
}

type CompReactSelectType = {
  className?: string;
  getOptions?: (setOptions: (args: any) => void) => void;
  menuPlacement?: "top" | "bottom" | "auto";
  onChange: (selectedObject: any) => void;
  optionLabelName: string;
  optionValueName: string;
  placeHolder?: string;
  ref: any;
  selectedValue: any;
  staticOptions?: any;
  [key: string]: any; // Allow additional props for register() spreading
};
