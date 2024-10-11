import axios from 'axios';
import AsyncSelect from 'react-select/async';

export function ReactSelectAsync(){
    const url = 'http://localhost:8000/countries'

    return (<div className='m-2 w-64'>
        <AsyncSelect
            loadOptions={loadOptionsAsync}
            // onChange={handleOnChange}
            placeholder='Type 3 chars'
            isClearable={true}
            isLoading={false}
            getOptionLabel={(option: any) => option.country}
            getOptionValue={(option: any) => option.id}
        />
    </div>)

    async function loadOptionsAsync(input: string){
        const response = await axios.get(`http://localhost:8000/countries`);
        // Map your data to the expected format for react-select
        // return response.data.map((item => ({
        //     label: item.name,  // The label displayed in the dropdown
        //     value: item.id,    // The value that will be stored/returned when selected
        // }));
        return(response.data)
    }
}