import AsyncSelect from 'react-select/async';
import axios from 'axios';
import _ from 'lodash'
import awPromise from 'awesome-debounce-promise'
// import Async, { useAsync } from 'react-select/async';
// import Select from 'react-select'
// import { ColourOption, colourOptions } from './data';

export function ReactSelectTypeAheadAsync() {
    const url = 'https://freetestapi.com/api/v1/countries?limit=50'

    const p = new Promise((resolve) => {
        const dbFunc = _.debounce(
            () =>
                axios.get(url).then((res: any) =>
                    resolve(res.data))
            , 2000)
        dbFunc()
    })

    return (<div className='m-2 w-64'>
        <AsyncSelect
            loadOptions={debounced1}
            onChange={handleOnChange}
            placeholder='Type 3 chars'
            isClearable={true}
            onInputChange={handleOnInputChange}
            isLoading={false}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.capital}
        // cacheOptions={true}
        />
        <button onClick={handleButtonClick} className='bg-slate-100 m-2'>Debounce</button>
    </div>)

    function handleButtonClick() {
        const d = _.debounce(() => {
            console.log('debounced')
        }
            , 1000)

        d()
    }

    function debounced(inputValue: string): Promise<any> {
        let res: any = undefined
        if (inputValue.length <= 2) {
            return (res)
        }
        const url = 'https://freetestapi.com/api/v1/countries?limit=50'
        const p = new Promise((resolve) => {
            setTimeout(
                () =>
                    axios.get(url).then((res: any) =>
                        resolve(res.data))
                , 1000)
            // axios.get(url).then((res: any) => resolve(res.data))
        })
        return (p.then((re: any) => re))
    }

    const dbFunc = (resolve:any) => _.debounce(
        () =>
            axios.get(url).then((res: any) =>
                resolve(res.data))
        , 1000)

    
    function debounced1(inputValue: string): Promise<any> {
        let res: any = undefined
        if (inputValue.length <= 2) {
            return (res)
        }

        return (p.then((re: any) => re))
    }

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

// const f: any = async () => {
//     const url = 'https://freetestapi.com/api/v1/countries?limit=50'
//     res = await axios.get(url)
// }

// const pr = setTimeout(f, 1000)
// return(res.data)
// return (pr)
// const deb : Promise<any> = _.debounce(() => loadOptions(inputValue), 1000)
// return(deb)
// return(loadOptions(inputValue))
// _.debounce(() => loadOptions(inputValue), 1000)