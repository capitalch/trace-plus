import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import _ from 'lodash'

export function CompReactSelect({
    className
    , getOptions
    , menuPlacement
    , onChange
    , optionLabelName
    , optionValueName
    , placeHolder
    , selectedValue
    , staticOptions
}: CompReactSelectType) {
    const [options, setOptions] = useState([])
    const selectRef: any = useRef(null)

    useEffect(() => {
        if (getOptions) {
            getOptions(setOptions)
        }
    }, [])

    useEffect(() => {
        if (!_.isEmpty(options)) {
            selectItem()
        }
    }, [options])

    useEffect(() => {
        if (!_.isEmpty(staticOptions)) {
            setOptions(staticOptions)
        }
    }, [staticOptions])

    return (<Select
        className={className}
        // escapeClearsValue={true} //Does not work
        getOptionLabel={(option: any) => option[optionLabelName]}
        getOptionValue={(option: any) => option[optionValueName]}
        // isClearable={true} //Does not work
        menuPlacement={menuPlacement || 'auto'}
        onChange={onChange}
        options={options}
        ref={selectRef}
        styles={getStyles()}
        placeholder={placeHolder}
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
    className?: string
    getOptions?: (setOptions: (args: any) => void) => void
    menuPlacement?: 'top' | 'bottom' | 'auto'
    onChange: ((selectedObject: any) => void)
    optionLabelName: string
    optionValueName: string
    placeHolder?: string
    ref: any
    selectedValue: any
    staticOptions?: any
}