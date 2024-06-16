import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
// import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';

export function PrimeReact(){
    const [selectedCity, setSelectedCity] = useState(null);
    const [checked, setChecked] = useState(false);
    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];
    return(<div className="m-4 w-max bg-slate-100">
        <Dropdown value={selectedCity}  style = {{border: '1px solid red'}}
        onChange={(e) => setSelectedCity(e.value)} optionLabel="name"
        className="w-56" placeholder="Select an item" options={cities} />
        <Checkbox onChange={(e:any) => setChecked(e.checkbox)} checked={checked} />
    </div>)
}
