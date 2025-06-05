import { ListBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { useDispatch, useSelector } from 'react-redux';
import { BusinessUnitType, currentBusinessUnitSelectorFn, userBusinessUnitsSelectorFn, setCurrentBusinessUnit } from '../../../login/login-slice';
import { useEffect, useRef, useState } from 'react';
import { AppDispatchType } from '../../../../app/store/store';
import { Utils } from '../../../../utils/utils';
import { TraceDataObjectType } from '../../../../utils/global-types-interfaces-enums';
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from '../../../../app/graphql/maps/graphql-queries-map';
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../../../app/global-constants';
import { Messages } from '../../../../utils/messages';
import { DatabaseTablesMap } from '../../../../app/graphql/maps/database-tables-map';

export function BusinessUnitsListModal() {
    const currentBusinessUnitsSelector: BusinessUnitType[] = useSelector(userBusinessUnitsSelectorFn) || []
    const currentBusinessUnitSelector: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}
    const dispatch: AppDispatchType = useDispatch()
    const [listBoxBusinessUnits, setListBoxBusinessUnits] = useState([])
    const listRef: any = useRef(null)

    useEffect(() => {
        prepareData()
    }, [])

    return (
        <div className='min-w-72'>
            <ListBoxComponent
                change={onChange}
                dataBound={onDataBound}
                dataSource={listBoxBusinessUnits}
                height='200'
                ref={listRef}
                selectionSettings={{ mode: 'Single' }}
            />
        </div>
    )

    function onChange(args: any) {
        const selectedBuId: number = args.items[0].id
        const selectedBu: BusinessUnitType = currentBusinessUnitsSelector.find((u: BusinessUnitType) => u.buId === selectedBuId) || {}
        dispatch(setCurrentBusinessUnit(selectedBu))
        if (currentBusinessUnitSelector.buId !== selectedBuId) {
            saveLastUsedBuId(selectedBuId)
        }
    }

    function onDataBound() { // for pre selection
        const currentBuId = currentBusinessUnitSelector?.buId
        const currBu: any = listBoxBusinessUnits.find((u: any) => u.id === currentBuId)
        const currBuText = currBu?.text
        if (listRef?.current) {
            listRef.current.selectItems([currBuText])
        }
    }

    function prepareData() { // change data in format {id, text}
        const cBus: any = currentBusinessUnitsSelector.map((x) => {
            return ({
                id: x.buId,
                text: `${x.buCode}: ${x.buName}`
            })
        })
        setListBoxBusinessUnits(cBus)
    }

    async function saveLastUsedBuId(buId: number) {
        const userId: number | undefined = Utils.getCurrentLoginInfo().userDetails?.id
        const traceDataObject: TraceDataObjectType = {
            tableName: DatabaseTablesMap.UserM,
            xData: {
                id: userId,
                lastUsedBuId: buId
            }
        }
        try {
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.genericUpdate;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({ isOpen: false });
            Utils.showSuccessAlertMessage({title:'Ok',message:Messages.messBuSuccessfullySelected});
        } catch (e: any) {
            console.log(e);
        }
    }
}