import { useEffect, useRef, useState } from 'react';
import Select from 'react-select'
import { Utils } from '../../../utils/utils';
import { useUtilsInfo } from '../../../utils/utils-info-hook';
import { SqlIdsMap } from '../../../app/maps/sql-ids-map';
import clsx from 'clsx';
import { IconRefresh } from '../../icons/icon-refresh';
import { shallowEqual, useSelector } from 'react-redux';
import { RootStateType } from '../../../app/store';
import { selectCompSwitchStateFn } from '../comp-slice';

export function AccountPickerFlat({
    accClassNames = null,
    accountOptions,
    className,
    instance,
    loadData,
    onChange,
    showAccountBalance = false,
    showRefreshButton =true,
    value
}: AccountPickerFlatType) {
    const selectRef: any = useRef<Select>(null);
    const [options, setOptions] = useState<AccountOptionType[]>([])
    const [accountBalance, setAccountBalance] = useState<number>(0)

    const isAllBranches: boolean =
        useSelector(
            (state: RootStateType) => selectCompSwitchStateFn(state, instance),
            shallowEqual
        ) || false;

    const {
        branchId,
        buCode
        , currentFinYear
        , dbName
        , decFormatter
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        if (accountOptions) {
            setOptions(accountOptions)
        } else {
            loadLocalData()
        }
    }, [accountOptions])

    useEffect(() => {
        if (value === null) {
            setAccountBalance(0)
        }
    }, [value])

    return (
        <div className='relative'>
            {showRefreshButton && <button onClick={handleOnClickRefresh} type='button' className='absolute text-blue-500 -top-5 -translate-x-1/2 left-1/2'><IconRefresh className='w-5 h-5' /></button>}
            <span className='absolute -top-5.5 right-1'>
                <label className='font-medium text-blue-400'>{decFormatter.format(Math.abs(accountBalance))}</label>
                {showAccountBalance && <label className={clsx(((accountBalance < 0) ? 'text-red-500' : 'text-blue-400'), 'font-bold')}>{(accountBalance < 0) ? ' Cr' : ' Dr'}</label>}
            </span>
            <Select
                className={clsx('w-full', className)}
                getOptionLabel={(option: AccountOptionType) => option.accName}
                getOptionValue={(option: AccountOptionType) => option.id}
                menuPlacement="auto"
                onChange={handleOnSelectAccount}
                options={options}
                placeholder="Select an account"
                ref={selectRef}
                styles={Utils.getReactSelectStyles()}
                components={{ Option: CustomOption }}
                value={options.find((opt: AccountOptionType) => opt.id === value) || null}
            />
        </div>)

    async function fetchAccountBalance(accId: string) {
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
            setAccountBalance(res?.[0]?.accountBalance || 0)
        } catch (e) {
            console.log(e)
        }
    }

    function handleOnClickRefresh() {
        if (loadData) {
            loadData()
        } else {
            loadLocalData()
        }
    }

    function handleOnSelectAccount(selectedAcc: AccountOptionType | null) {
        if (showAccountBalance) {
            if (selectedAcc?.id) {
                fetchAccountBalance(selectedAcc.id)
            }
        }
        onChange?.(selectedAcc?.id || null)
    }

    async function loadLocalData() {
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

            setOptions(res || [])
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
    accClassNames?: AccClassName[] | null
    accountOptions?: AccountOptionType[]
    className?: string;
    instance: string
    loadData?: () => void
    onChange?: (value: string | null) => void;
    showAccountBalance?: boolean
    showRefreshButton?: boolean
    value?: string | null;
}

export type AccountOptionType = {
    id: string;
    accName: string;
    accParent: string;
    isSubledger: boolean;
}

export type AccClassName =
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