import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { useEffect } from 'react';
import { ibukiDebounceFilterOn, ibukiEmit } from '../../app/ibuki';

export function ReactSelectTypeAheadAsync1() {
    const url = 'https://freetestapi.com/api/v1/countries?limit=50'
    // const couns: any[] = [
    //     {
    //         name: 'United States',
    //         capital: 'United States',
    //     },
    //     {
    //         name: 'Canada',
    //         capital: 'Canada',
    //     }
    // ]
    useEffect(() => {
        const obs1: any = ibukiDebounceFilterOn('DEBOUNCE-ASYNC1', 1200).subscribe(async (d: any) => {
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
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.capital}
        />
        <button onClick={handleButtonClick} className='m-2 bg-slate-200 px-2'>Test</button>
    </div>)

    async function handleButtonClick(){
        // const res: any = await axios.get(url)
        // alert(res.data)
        const output: any = { val: [] }
        const resolve = async (val: any) => { 
            output.val = val
            
            // alert(output.val)
            // return(output.val)
        }
        ibukiEmit('DEBOUNCE-ASYNC1', { action: resolve })
        // resolve().then((rrr)=>rrr)
    }

    async function debounced(inputValue: string): Promise<any> {
        const res: any = undefined
        if (inputValue.length <= 2) {
            return (res)
        }
        const promiseWrapper = () => new Promise((resolve) => {
            ibukiEmit('DEBOUNCE-ASYNC1', { action: resolve })
        })
        
        return (await promiseWrapper())
        // return (promiseWrapper().then((options: any) => options))
    }

    async function debounced1(inputValue: string): Promise<any> {
        const res: any = undefined
        if (inputValue.length <= 2) {
            return (res)
        }
        const wrapper = async () => {
            const output: any = { val: [] }
            const resolve = (val: any) => { 
                output.val = val 
                return(output.val)
            }
            ibukiEmit('DEBOUNCE-ASYNC1', { action: resolve })
            // return output.val
            // return (resolve)
        }
        return (
            await wrapper()
        )
        // const promiseWrapper = () => new Promise((resolve) => {
        //     ibukiEmit('DEBOUNCE-ASYNC1', { action: resolve })
        // })
        // return (promiseWrapper().then((options: any) => options))
    }

    function handleOnChange(e: any) {
        console.log(e)
    }
}
