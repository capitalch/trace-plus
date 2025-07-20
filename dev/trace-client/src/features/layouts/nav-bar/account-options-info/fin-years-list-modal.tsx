import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs'
import { ListBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { allFinYearsSelectorFn, currentDateFormatSelectorFn, currentFinYearSelectorFn, FinYearType, setCurrentFinYear } from '../../../login/login-slice';
import { AppDispatchType } from '../../../../app/store';
import { Utils } from '../../../../utils/utils';
import { TraceDataObjectType } from '../../../../utils/global-types-interfaces-enums';
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from '../../../../app/graphql/maps/graphql-queries-map';
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../../../app/global-constants';
import { Messages } from '../../../../utils/messages';
import { DatabaseTablesMap } from '../../../../app/graphql/maps/database-tables-map';

export function FinYearsListModal() {
    const allFinYears: FinYearType[] = useSelector(allFinYearsSelectorFn) || [];
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const currentDateFormat: string = useSelector(currentDateFormatSelectorFn) || ''

    const dispatch: AppDispatchType = useDispatch();
    const [listBoxFinYears, setListBoxFinYears] = useState([]);
    const listRef: any = useRef(null);

    useEffect(() => {
        prepareData();
    }, []);

    return (
        <div className='min-w-72'>
            <ListBoxComponent
                change={onChange}
                dataBound={onDataBound}
                dataSource={listBoxFinYears}
                height='200'
                ref={listRef}
                selectionSettings={{ mode: 'Single' }}
            />
        </div>
    );

    function onChange(args: any) {
        const selectedFinYearId: number = args.items[0].id;
        const selectedFinYear: FinYearType = allFinYears.find(
            (fy: FinYearType) => fy.finYearId === selectedFinYearId
        ) || currentFinYear;
        dispatch(setCurrentFinYear(selectedFinYear));
        if (currentFinYear.finYearId !== selectedFinYearId) {
            saveLastUsedFinYearId(selectedFinYearId);
        }
    }

    function onDataBound() {
        const currentFinYearId = currentFinYear?.finYearId;
        const currFinYear: any = listBoxFinYears.find((fy: any) => fy.id === currentFinYearId);
        const currFinYearText = currFinYear?.text;
        if (listRef?.current) {
            listRef.current.selectItems([currFinYearText]);
        }
    }

    function prepareData() {
        const cFinYears: any = allFinYears.map((x) => ({
            id: x.finYearId,
            text: `${x.finYearId}: (${dayjs(x.startDate).format(currentDateFormat)} - ${dayjs(x.endDate).format(currentDateFormat)})`
        }));
        setListBoxFinYears(cFinYears);
    }

    async function saveLastUsedFinYearId(finYearId: number) {
        const userId: number | undefined = Utils.getCurrentLoginInfo().userDetails?.id;
        const traceDataObject: TraceDataObjectType = {
            tableName: DatabaseTablesMap.UserM,
            xData: {
                id: userId,
                lastUsedFinYearId: finYearId
            }
        };
        try {
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.genericUpdate;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({ isOpen: false });
            Utils.showSuccessAlertMessage({ title: 'Ok', message: Messages.messFinYearSuccessfullySelected });
        } catch (e: any) {
            console.log(e);
        }
    }
}
