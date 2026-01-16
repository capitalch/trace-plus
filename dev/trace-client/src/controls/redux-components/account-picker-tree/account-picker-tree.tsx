import { DdtSelectEventArgs, DropDownTreeComponent, FieldsModel } from "@syncfusion/ej2-react-dropdowns";
import { useEffect, useRef, useState } from "react";
import { AppDispatchType, RootStateType } from "../../../app/store";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useUtilsInfo } from "../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../app/maps/sql-ids-map";
import { Utils } from "../../../utils/utils";
import { setAccountPickerAccId } from "./account-picker-tree-slice";
import clsx from "clsx";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconRefresh } from "../../icons/icon-refresh";
import { selectCompSwitchStateFn } from "../comp-slice";
import { IconCross } from "../../icons/icon-cross";
import { BusinessUnitType, currentBusinessUnitSelectorFn } from "../../../features/login/login-slice";

export function AccountPickerTree({
    className,
    instance,
    showAccountBalance = false,
}: AccountPickerTreeType) {
    const dispatch: AppDispatchType = useDispatch();
    const dropDownTreeRef = useRef<DropDownTreeComponent | null>(null);
    const [accountOptions, setAccountOptions] = useState<AccountOptionType[]>([])
    const [accountBalance, setAccountBalance] = useState<number>(0);
    
    const isAllBranches: boolean =
        useSelector(
            (state: RootStateType) => selectCompSwitchStateFn(state, instance),
            shallowEqual
        ) || false;
    const selectedAccountPickerAccId = useSelector((state: RootStateType) => state.accountPickerTree[instance]?.id, shallowEqual)
    const {
        branchId
        , buCode
        , currentFinYear
        , dbName
        , decFormatter
        , decodedDbParamsObject
    } = useUtilsInfo()

    const fields: FieldsModel = {
        dataSource: accountOptions as AccountOptionType[],
        value: "id",
        parentValue: "parentId",
        text: "accName",
        hasChildren: "hasChild",
    };

    const currentBusinessUnitSelector: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    
    useEffect(() => {
        handleClear()
        loadAccountOptions()
    }, [currentBusinessUnitSelector])

    // Programmatically select account when Redux state changes (e.g., from navigation)
    useEffect(() => {
        if (selectedAccountPickerAccId && accountOptions.length > 0 && dropDownTreeRef.current) {
            dropDownTreeRef.current.value = [selectedAccountPickerAccId.toString()]
            dropDownTreeRef.current.dataBind()
            // Fetch balance if needed
            if (showAccountBalance) {
                fetchAccountBalance(+selectedAccountPickerAccId)
            }
        }
    }, [selectedAccountPickerAccId, accountOptions, showAccountBalance])

    return (
        <div className={clsx('flex flex-col gap-2 w-96 mr-6 mb-8', className,)}>
            {/* Header */}
            <div className='flex items-center justify-between h-6 text-md bg-slate-50'>
                <label className='font-medium text-primary-400'>Accounts</label>
                <TooltipComponent className='mt-2 ml-8' content='Clear' position='TopCenter'>
                    <button onClick={handleClear}>
                        <IconCross className='w-5 h-5 text-blue-500' />
                    </button>
                </TooltipComponent>
                <TooltipComponent className='mt-2 ml-8' content='Refresh' position='TopCenter'>
                    <button onClick={loadAccountOptions}>
                        <IconRefresh className='w-5 h-5 text-blue-500' />
                    </button>
                </TooltipComponent>
                {showAccountBalance && <span className='ml-auto'>
                    <label className='font-medium text-blue-400'>{decFormatter.format(Math.abs(accountBalance))}</label>
                    {showAccountBalance && <label className={clsx(((accountBalance < 0) ? 'text-red-500' : 'text-blue-400'), 'font-bold')}>{(accountBalance < 0) ? ' Cr' : ' Dr'}</label>}
                </span>}
            </div>
            <DropDownTreeComponent
                allowFiltering={true}
                allowMultiSelection={false}
                className="h-10"
                fields={fields}
                filterBarPlaceholder="Search"
                filterType="Contains"
                id="dropDowntree"
                placeholder="Select account / subledger a/c ..."
                popupHeight="300px"
                ref={dropDownTreeRef}
                select={handleOnSelectAccount}
                showClearButton={false}
                // value={['167']}
            />
        </div>
    );

    async function fetchAccountBalance(accId: number) {
        try {
            const res: any = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                sqlArgs: {
                    branchId: isAllBranches ? null : branchId,
                    accId: accId,
                    finYearId: currentFinYear?.finYearId,
                },
                sqlId: SqlIdsMap.getAccountBalance,
            })
            const balance = res?.[0]?.accountBalance || 0
            setAccountBalance(balance)
        } catch (error) {
            console.error(error)
        }
    }

    function handleClear() {
        setAccountBalance(0)
        dispatch(setAccountPickerAccId({
            instance: instance,
            id: null
        }))
        if (dropDownTreeRef.current) {
            dropDownTreeRef.current.value = [];
            dropDownTreeRef.current.dataBind();
        }
    }

    function handleOnSelectAccount(args: DdtSelectEventArgs) {
        const selectedAcc: any = args?.itemData || {}
        dispatch(setAccountPickerAccId({
            instance: instance,
            id: selectedAcc?.id || null
        }))
        if (showAccountBalance) {
            fetchAccountBalance(selectedAcc?.id || null)
        }
    }

    async function loadAccountOptions() {
        try {
            const res: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlId: SqlIdsMap.getLedgerLeafSubLedgerAccounts,
            })
            res.forEach((item: any) => {
                item.hasChild = !item.isLeaf
                item.selectable = item.isLeaf
            })
            setAccountOptions(res || [])
        } catch (error) {
            console.error(error)
        }
    }
}

type AccountOptionType = {
    id: string;
    parentId: string;
    accName: string;
    hasChild: boolean;
}

type AccountPickerTreeType = {
    className?: string;
    instance: string;
    showAccountBalance?: boolean;
}