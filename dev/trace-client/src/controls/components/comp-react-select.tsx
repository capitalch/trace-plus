import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import _ from 'lodash'

export function CompReactSelect({
    getOptions
    , onChange
    , optionLabelName
    , optionValueName
    // , ref
    , selectedValue
}: CompReactSelectType) {
    const [options, setOptions] = useState([])
    const selectRef: any = useRef(null)

    useEffect(() => {
        getOptions(setOptions)
    }, [])

    useEffect(() => {
        if (!_.isEmpty(options)) {
            selectItem()
        }
    }, [options])

    return (<Select
        // escapeClearsValue={true} //Does not work
        getOptionLabel={(option: any) => option[optionLabelName]}
        getOptionValue={(option: any) => option[optionValueName]}
        // isClearable={true} //Does not work
        onChange={onChange}
        options={options}
        ref={selectRef}
        styles={getStyles()}
    />)

    function selectItem() {
        const selectedOption: any = options.find((option: any) => option[optionValueName] === selectedValue)
        selectRef.current.setValue(selectedOption)
    }

    function getStyles() {
        return ({
            input: (base: any) => ({
                ...base,
                minWidth: '15rem',
                "input:focus": {
                    boxShadow: "none",
                },
            }),
            option: (defaultStyles: any) => ({
                ...defaultStyles,
                paddingTop: '2px',
                paddingBottom: '2px',
                fontSize: '14px',
            }),
        })
    }
}

type CompReactSelectType = {
    getOptions: (setOptions: (args: any) => void) => void
    onChange: ((selectedObject: any) => void)
    optionLabelName: string
    optionValueName: string
    ref: any
    selectedValue: any
}