import AsyncSelect from 'react-select/async';
import axios from 'axios';
import _ from 'lodash'
// import Async, { useAsync } from 'react-select/async';
// import Select from 'react-select'
// import { ColourOption, colourOptions } from './data';

export function ReactSelectTypeAhead() {

    return (<div className='m-2 w-64'>
        <AsyncSelect
            loadOptions={debounced}
            onChange={handleOnChange}
            placeholder='Type 3 chars'
            isClearable={true}
            onInputChange={handleOnInputChange}
            isLoading={false}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.capital}
        // cacheOptions={true}
        />
    </div>)

    async function loadOptions(inputValue: string) {
        let res: any = undefined
        if (inputValue.length > 2) {
            const url = 'https://freetestapi.com/api/v1/countries?limit=50'
            res = await axios.get(url)
        }
        return res.data
    }

    function handleOnChange(e: any) {
        console.log(e)
    }

    function handleOnInputChange(e: any) {
        console.log(e)
    }

    async function debounced(inputValue: string): Promise<any> {
        let res: any = undefined
        if (inputValue.length <= 2) {
            return (res)
        }
        const url = 'https://freetestapi.com/api/v1/countries?limit=50'
        // const f: any = async () => {
        //     const url = 'https://freetestapi.com/api/v1/countries?limit=50'
        //     res = await axios.get(url)
        // }

        // const pr = setTimeout(f, 1000)
        // return(res.data)
        _.debounce(async () => {
            res = await axios.get(url)
        }, 0)
        res = await axios.get(url)
        return (res.data)

        // return (pr)
        // const deb : Promise<any> = _.debounce(() => loadOptions(inputValue), 1000)
        // return(deb)
        // return(loadOptions(inputValue))
        // _.debounce(() => loadOptions(inputValue), 1000)
    }
}


// function loadOptions(inputValue: string, callback: (options: ColourOption[]) => void) {
//     if (inputValue.length < 2) {
//         return (undefined)
//     }
//     setTimeout(() => {
//         callback(filterColors(inputValue));
//     }, 1000);
// }

// function filterColors(inputValue: string) {
//     return colourOptions.filter((i) =>
//         i.label.toLowerCase().includes(inputValue.toLowerCase())
//     );
// }

