// import Select from 'react-select'
import AsyncSelect from 'react-select/async';
import { ColourOption, colourOptions } from './data';
// import Async, { useAsync } from 'react-select/async';

export function ReactSelectTypeAhead() {

    return (<div className='m-2 w-64'>
        <AsyncSelect
            loadOptions={loadOptions}
            onChange={handleOnChange}
            placeholder='Type 3 chars'
            // escapeClearsValue={true}
            isClearable={true}
            onInputChange={handleOnInputChange}
        />
        {/* <Select options={options} /> */}
    </div>)

    function loadOptions(inputValue: string, callback: (options: ColourOption[]) => void) {
        if(inputValue.length < 2){
            return(undefined)
        }
        setTimeout(() => {
            callback(filterColors(inputValue));
        }, 1000);
    }

    function filterColors(inputValue: string) {
        return colourOptions.filter((i) =>
            i.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    }

    function handleOnChange(e: any) {
        console.log(e)
    }

    function handleOnInputChange(e: any) {
        console.log(e)
    }
}

// const filterColors = (inputValue: string) => {
//     return colourOptions.filter((i) =>
//         i.label.toLowerCase().includes(inputValue.toLowerCase())
//     );
// };

