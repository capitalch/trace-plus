import { useEffect } from "react"
import { ibukiDebounceFilterOn, ibukiEmit } from "../../utils/ibuki"
import axios from "axios"
import AsyncSelect from "react-select/async"

export function CompTypeAhead({
    instance
    , noOfCharsToType = 2
    , onChange
    , optionLabel
    , optionValue
    , url
    , ref
}: CompTypeAheadType) {
    const messageName = instance
    const placeHolder = `Type ${noOfCharsToType} chars to start selection`
    useEffect(() => {
        const obs1: any = ibukiDebounceFilterOn(messageName, 1200).subscribe(async (d: any) => {
            const input = d.data?.inputValue
            const res: any = await axios.post(url, { criteria: input })
            d.data.action(res.data)
        })
        return (() => {
            obs1.unsubscribe()
        })
    }, [])

    return (
        <AsyncSelect
            className=""
            escapeClearsValue={true}
            loadOptions={debouncedLoadOptions}
            onChange={onChange}
            placeholder={placeHolder}
            ref={ref}
            isClearable={true}
            isLoading={false}
            getOptionLabel={(option: any) => option[optionLabel]}
            getOptionValue={(option: any) => option[optionValue]}
            styles={getStyles()}
        />
    )

    async function debouncedLoadOptions(inputValue: string): Promise<any> {
        const nullPromiseWrapper = () => new Promise((resolve) => {
            return resolve([])
        })
        if (inputValue.length <= (+noOfCharsToType - 1)) {
            return (await nullPromiseWrapper())
        }
        const promiseWrapper = () => new Promise((resolve) => {
            ibukiEmit(messageName, { action: resolve, token: '', inputValue: inputValue })
        })
        return (await promiseWrapper())
    }

    function getStyles() {
        return ({
            input: (defaultStyles: any) => ({
                ...defaultStyles,
                minWidth: '15rem',
                "input:focus": {
                    boxShadow: "none",
                },
            }),
            option: (defaultStyles: any, state: any) => ({
                ...defaultStyles,
                paddingTop: '2px',
                paddingBottom: '2px',
                fontSize: '14px',
            }),
            // valueContainer: (defaultStyles: any, state: any) => ({
            //     ...defaultStyles,
            //     fontSize: '14px',
            // }),
            // control: (base: any) => ({
            //     ...base,
            //     width: '20rem'
            // }),
        })
    }
}

type CompTypeAheadType = {
    instance: string
    noOfCharsToType?: number
    onChange: ((selectedObject: any) => void)
    optionLabel: string
    optionValue: string
    url: string
    ref: any
}