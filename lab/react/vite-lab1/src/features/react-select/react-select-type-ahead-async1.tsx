import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { useEffect } from 'react';
import { ibukiDebounceFilterOn, ibukiEmit } from '../../app/ibuki';

export function ReactSelectTypeAheadAsync1() {
    const url = 'http://localhost:8000/countries'
    const messageName = 'DEBOUNCE-ASYNC1'
    useEffect(() => {
        const obs1: any = ibukiDebounceFilterOn(messageName, 1200).subscribe(async (d: any) => {
            console.log(d.data?.inputValue)
            const res: any = await axios.get(url)
            d.data.action(res.data)
        })
        return (() => {
            obs1.unsubscribe()
        })
    }, [])

    return (<div className='m-2 w-64'>
        <AsyncSelect
            loadOptions={debounced}
            onChange={handleOnChange}
            placeholder='Type 3 chars'
            isClearable={true}
            isLoading={false}
            getOptionLabel={(option: any) => option.country}
            getOptionValue={(option: any) => option.id}
        />
        {/* <button onClick={handleButtonClick} className='m-2 bg-slate-200 px-2'>Test</button> */}
    </div>)

    // async function handleButtonClick(){
       
    //     const output: any = { val: [] }
    //     const resolve = async (val: any) => { 
    //         output.val = val
    //     }
    //     ibukiEmit('DEBOUNCE-ASYNC1', { action: resolve })
    // }

    async function debounced(inputValue: string): Promise<any> {
        const nullPromiseWrapper = () => new Promise((resolve) => {
            return resolve([])
        })
        if (inputValue.length <= 2) {
            return (await nullPromiseWrapper())
        }
        const promiseWrapper = () => new Promise((resolve) => {
            ibukiEmit(messageName, { action: resolve, token: '', inputValue: inputValue })
        })
        return (await promiseWrapper())
    }

    function handleOnChange(e: any) {
        console.log(e)
    }

    // function getObjectValue() {
    //     let objectValue = null // Only works with null. The 'undefined' and {id:undefined,name:undefined} and any other combination does not activate the 'placeholder'
    //     if (selectedObject.id) {
    //         objectValue = {
    //             name: selectedObject.name,
    //             id: selectedObject.id
    //         }
    //     }
    //     return (objectValue)
    // }
}
