import { useEffect, useRef, useState } from 'react';
import Select from 'react-select'
import { Utils } from '../../../utils/utils';
import { useUtilsInfo } from '../../../utils/utils-info-hook';
// import { shallowEqual, useSelector } from 'react-redux';
// import { RootStateType } from '../../../app/store/store';
// import { selectCompSwitchStateFn } from '../comp-slice';
import { SqlIdsMap } from '../../../app/graphql/maps/sql-ids-map';

export function AccountPickerFlat({
    accClassNames = [null],
    className,
    instance,
    // showAccountBalance
}: AccountPickerFlatType) {
    const selectRef: any = useRef<Select>(null);
    const [accountOptions, setAccountOptions] = useState<AccountOptionType[]>([])

    // const isAllBranches: boolean =
    //     useSelector(
    //         (state: RootStateType) => selectCompSwitchStateFn(state, instance),
    //         shallowEqual
    //     ) || false;

    const {
        // branchId
        buCode
        // , currentFinYear
        , dbName
        // , decFormatter
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        loadAccountOptions()
    }, [])

    return (<Select

        className={className}
        getOptionLabel={(option: AccountOptionType) => option.accName}
        getOptionValue={(option: AccountOptionType) => option.id}
        menuPlacement='auto'
        onChange={handleOnSelectAccount}
        options={accountOptions}
        placeholder='Select an account'
        ref={selectRef}
        styles={Utils.getReactSelectStyles()}
    />)

    function handleOnSelectAccount(selectedAcc: AccountOptionType | null) {
        console.log(selectedAcc)
        // dispatch(setAccountPickerAccId({
        //     instance: instance,
        //     id: selectedAcc?.id || null
        // }))
        // if (showAccountBalance) {
        //     fetchAccountBalance(selectedAcc?.id || null)
        // }
    }

    async function loadAccountOptions() {
        try {
            const res: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                sqlArgs: {
                    accClassNames: accClassNames.join(',')
                }
            })

            setAccountOptions(res || [])
        } catch (error) {
            console.error(error)
        }
    }
}

type AccountPickerFlatType = {
    accClassNames: AccClassName[]
    className?: string;
    instance: string
    showAccountBalance?: boolean

    // menuPlacement?: "top" | "bottom" | "auto";
    // onChange: (selectedObject: any) => void;
    // options: []
    // optionLabelName: string;
    // optionValueName: string;
    // placeHolder?: string;
}

type AccountOptionType = {
    id: string;
    accName: string;
    isSubledger: boolean;
}

type AccClassName =
    null
    | 'capital'
    | 'loan'
    | 'other'
    | 'iexp'
    | 'purchase'
    | 'dexp'
    | 'dincome'
    | 'iincome'
    | 'sale'
    | 'creditor'
    | 'debtor'
    | 'bank'
    | 'cash'
    | 'card'
    | 'ecash'