import { ListBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { useSelector } from 'react-redux';
import { BusinessUnitType, currentBusinessUnitSelectorFn, currentBusinessUnitsSelectorFn } from '../../../login/login-slice';
export function BusinessUnitsListModal() {
    const currentBusinessUnitsSelector: BusinessUnitType[] = useSelector(currentBusinessUnitsSelectorFn) || []
    const currentBusinessUnitSelector: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}

    const currentBusinessUnits: any = currentBusinessUnitsSelector.map((x) => {
        return ({
            id: x.buId,
            text: x.buName
        })
    })
    return (
        <div className='min-w-72'>
            <ListBoxComponent dataSource={currentBusinessUnits}
                height='200'
                selectionSettings={{ mode: 'Single' }}
            />
        </div>
    )
}