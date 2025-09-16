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
  ...otherProps
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
  const {
    name,
    onBlur,
    ...selectProps
  } = otherProps;

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
    const selectedOption: any = options.find(
      (option: any) => option[optionValueName] === selectedValue
    );
    if (selectedOption && selectRef.current) {
      selectRef.current.setValue(selectedOption);
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
