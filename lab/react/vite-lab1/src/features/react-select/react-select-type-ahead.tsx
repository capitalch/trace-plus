import { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { ibukiDebounceFilterOn, ibukiEmit, ibukiFilterOn } from '../../app/ibuki'
import axios from 'axios'

export function ReactSelectTypeAhead() {
    const defaultOptions = [
        {
            name:'India',
            capital: "New Delhi"
        }
    ]
    const [options, setOptions]:any[] = useState(defaultOptions)
    const url: string = 'https://freetestapi.com/api/v1/countries?limit=50'
    useEffect(() => {
        const res: any = ibukiDebounceFilterOn('DEBOUNCE', 1200).subscribe((d: any) => {
            console.log(d.data)
            loadData(d.data)
        })
        return (() => {
            res.unsubscribe()
        })
    }, [])

    return (<div className='w-64 mt-10 ml-2'>
        <ReactSelect
            placeholder='Type 3 chars'
            options={options}
            onInputChange={handleOnInputChange}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.capital}
        />
    </div>)

    function handleOnInputChange(inputValue: string) {
        if (inputValue.length > 2) {
            ibukiEmit('DEBOUNCE', inputValue)
        } else {
            // setOptions([])
        }
    }

    async function loadData(args: string) {
        const res: any = await axios.get(url)
        const arr: any[] = res.data
        setOptions([...arr])
    }
}