import { useEffect, useRef, useState } from 'react';
import Select from 'react-select'
import { Utils } from '../../../utils/utils';
import { useUtilsInfo } from '../../../utils/utils-info-hook';
// import { shallowEqual, useSelector } from 'react-redux';
// import { RootStateType } from '../../../app/store/store';
// import { selectCompSwitchStateFn } from '../comp-slice';
import { SqlIdsMap } from '../../../app/graphql/maps/sql-ids-map';
import clsx from 'clsx';

// import { components } from 'react-select';

export function AccountPickerFlat({
    accClassNames = [null],
    className,
    instance,
    onChange,
    // showAccountBalance,
    value
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

    return (
        <Select
            className={clsx('w-full', className)}
            getOptionLabel={(option: AccountOptionType) => option.accName}
            getOptionValue={(option: AccountOptionType) => option.id}
            menuPlacement="auto"
            onChange={handleOnSelectAccount}
            options={accountOptions}
            placeholder="Select an account"
            ref={selectRef}
            styles={Utils.getReactSelectStyles()}
            components={{ Option: CustomOption }}
            value={accountOptions.find((opt: AccountOptionType) => opt.id === value) || null}
        />)

    function handleOnSelectAccount(selectedAcc: AccountOptionType | null) {
        onChange?.(selectedAcc?.id || null)
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
                    accClassNames: accClassNames?.join(',') || null
                }
            })

            setAccountOptions(res || [])
        } catch (error) {
            console.error(error)
        }
    }
}

function CustomOption(props: any) {
    const {
        data,
        isFocused,
        isSelected,
        innerRef,
        innerProps,
        selectProps,
    } = props;

    const index = selectProps.options.findIndex((opt: any) => opt.id === data.id);
    const isEven = index % 2 === 0;

    const bgColor = isSelected
        ? '#dcefff'
        : isFocused
            ? '#f0f8ff'
            : isEven
                ? '#ffffff'
                : '#f9f9f9';

    return (
        <div
            ref={innerRef}
            {...innerProps}
            style={{
                backgroundColor: bgColor,
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1.4,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'start',
                gap: '8px',
                borderBottom: '1px solid #eee'
            }}>
            {data.isSubledger && (
                <div style={{ color: '#0077cc', fontSize: '12px', lineHeight: '18px' }}>
                    🔹
                </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div
                    style={{
                        fontWeight: 500,
                        color: data.isSubledger ? '#0066cc' : '#333',
                    }}>
                    {data.accName}
                </div>
                <div
                    style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666',
                    }}>
                    {data.accParent}
                </div>
            </div>
        </div>
    );
}

type AccountPickerFlatType = {
    accClassNames: AccClassName[] | null
    className?: string;
    instance: string
    onChange?: (value: string | null) => void;
    showAccountBalance?: boolean
    value?: string | null;
}

type AccountOptionType = {
    id: string;
    accName: string;
    accParent: string;
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