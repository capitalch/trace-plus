import { Dropdown } from "primereact/dropdown";
import { useState } from "react";

export function PrimeReact(){
    const [selectedCity, setSelectedCity] = useState(null);
    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];
    return(<div className="m-4 w-max bg-slate-100">
        <Dropdown value={selectedCity} style = {{border: '1px solid red'}}
        onChange={(e) => setSelectedCity(e.value)} optionLabel="name"
        className="w-56" placeholder="Select an item" options={cities} />
    </div>)
}
