import { ListBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { allBranchesSelectorFn, BranchType, currentBranchSelectorFn, setCurrentBranch } from "../../../login/login-slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { AppDispatchType } from "../../../../app/store";
import { Utils } from "../../../../utils/utils";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Messages } from "../../../../utils/messages";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";

export function BranchOptionsListModal() {
    const allBranches: BranchType[] = useSelector(allBranchesSelectorFn) || []
    const currentBranch: BranchType | undefined= useSelector(currentBranchSelectorFn)
    const dispatch: AppDispatchType = useDispatch();
    const [listBoxBranches, setListBoxBranches] = useState([]);
    const listRef: any = useRef(null);

    useEffect(() => {
        prepareData();
    }, []);

    return (<div className='min-w-72'>
        <ListBoxComponent
            change={onChange}
            dataBound={onDataBound}
            dataSource={listBoxBranches}
            height='200'
            ref={listRef}
            selectionSettings={{ mode: 'Single' }}
        />
    </div>)

    function onChange(args: any) {
        const selectedBranchId: number = args.items[0].id;
        const selectedBranch: BranchType |undefined = allBranches.find(
            (br: BranchType) => br.branchId === selectedBranchId
        ) || currentBranch;
        if(selectedBranch){
            dispatch(setCurrentBranch(selectedBranch));
        }
        
        if (currentBranch?.branchId !== selectedBranchId) {
            saveLastUsedBranchId(selectedBranchId);
        }
    }

    function onDataBound() {
        const currentBranchId = currentBranch?.branchId;
        const currBranch: any = listBoxBranches.find((br: any) => br.id === currentBranchId);
        const currBranchText = currBranch?.text;
        if (listRef?.current && currBranchText) {
            listRef.current.selectItems([currBranchText]);
        }
    }

    function prepareData() {
        const cBranches: any = allBranches.map((x) => ({
            id: x.branchId,
            text: `${x.branchCode}: ${x.branchName}`
        }));
        setListBoxBranches(cBranches);
    }

    async function saveLastUsedBranchId(branchId: number) {
        const userId: number | undefined = Utils.getCurrentLoginInfo().userDetails?.id;
        const traceDataObject: TraceDataObjectType = {
            tableName: DatabaseTablesMap.UserM,
            xData: {
                id: userId,
                lastUsedBranchId: branchId
            }
        };
        try {
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.genericUpdate;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({ isOpen: false });
            Utils.showSuccessAlertMessage({ title: 'Ok', message: Messages.messBranchSuccessfullySelected });
        } catch (e: any) {
            console.log(e);
        }
    }
}