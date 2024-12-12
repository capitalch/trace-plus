import Select, { components } from 'react-select'
import clsx from 'clsx'
import { Utils } from '../../utils/utils'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { SqlIdsMap } from '../../app/graphql/maps/sql-ids-map'
import { AppDispatchType, RootStateType } from '../../app/store/store'
import { selectLedgerSubledgerFieldFn, updateLedgerSubledger } from './comp-slice'
import { SqlArgsType } from '../components/syncfusion-grid/comp-syncfusion-grid'
import { useEffect, useRef, useState } from 'react'
import { IconRefresh } from '../icons/icon-refresh'
import { TooltipComponent } from '@syncfusion/ej2-react-popups'
import { useUtilsInfo } from '../../utils/utils-info-hook'

export function LedgerSubledger({
    className,
    heading = '',
    instance,
    isAllBranches = false,
    showAccountBalance = false,
    sqlArgs,
    sqlId
}: LedgerSubledgerType) {
    const dispatch: AppDispatchType = useDispatch()
    const [isSecondSelectDisabled, setSecondSelectDisabled] = useState(true)
    const firstSelectRef: any = useRef(null)
    const secondSelectRef: any = useRef(null)

    // Selectors
    const ledgerAndLeafData: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'ledgerandLeafData'), shallowEqual)
    const subledgerData: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'subLedgerData'), shallowEqual)
    const hasError: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'hasError'), shallowEqual)
    const accountBalance: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'accountBalance'), shallowEqual)

    const {
        branchId
        , buCode
        , dbName
        , decFormatter
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    useEffect(() => {
        loadFirstSelectOptions()
    }, [])

    return (<div className={clsx('flex flex-col w-60', className,)} >

        {/* Header */}
        <div className='h-6 bg-slate-50 flex text-md items-center'>
            <label className='font-medium text-primary-400'>{heading}</label>
            <TooltipComponent className='ml-8 mt-2' content='Refresh' position='TopCenter'>
                <button onClick={handleOnClickRefresh}>
                    <IconRefresh className='text-blue-500 h-5 w-5' />
                </button>
            </TooltipComponent>
            <span className='ml-auto'>
                <label className='font-medium text-blue-400'>{decFormatter.format(Math.abs(accountBalance))}</label>
                {showAccountBalance && <label className={clsx(((accountBalance < 0) ? 'text-red-500' : 'text-blue-400'), 'font-bold')}>{(accountBalance < 0) ? ' Cr' : ' Dr'}</label>}
            </span>
        </div>
        <div className={`${hasError ? 'border-[3px] border-red-500' : 'border-none'}`}>
            <Select
                components={{ Option: customOption }}
                getOptionLabel={(e: AccountType) => e.accName}
                getOptionValue={(e: AccountType) => e.id.toString()}
                isClearable={true}
                maxMenuHeight={150}
                menuPlacement="auto"
                menuShouldScrollIntoView={false}
                onChange={handleOnChangeFirstSelect}
                options={ledgerAndLeafData}
                placeholder='Select account'
                ref={firstSelectRef}
                styles={getStyles()}
            />
            <Select
                getOptionLabel={(e: AccountType) => e.accName}
                getOptionValue={(e: AccountType) => e.id.toString()}
                isDisabled={isSecondSelectDisabled}
                maxMenuHeight={150}
                onChange={handleOnChangeSecondSelect}
                placeholder='Select subledger account'
                ref={secondSelectRef}
                styles={getStyles()}
                options={subledgerData || []}
            />
        </div>
    </div>)

    function clearSecondSelect() {
        if (secondSelectRef.current) {
            secondSelectRef.current.clearValue()
        }
    }

    function customOption(props: any) {
        const { data } = props
        return (
            <components.Option {...props}>
                <span style={{ fontWeight: data.accLeaf === 'L' ? 'bolder' : 'normal' }}>
                    {data.accName}{data.accLeaf === 'L' ? ' >>>' : ''}
                </span>
            </components.Option>
        )
    }

    function getStyles() {
        return ({
            input: (defaultStyles: any) => ({
                ...defaultStyles,
                "input:focus": {
                    boxShadow: "none",
                },
            }),
            option: (defaultStyles: any) => ({
                ...defaultStyles,
                paddingTop: '2px',
                paddingBottom: '2px',
                fontSize: '16px',
            }),
        })
    }

    function handleOnClickRefresh() {
        // loadData()
        loadFirstSelectOptions()
        dispatch(updateLedgerSubledger({
            instance: instance,
            updates: {
                accountBalance: 0,
                finalAccId: undefined,
                hasError: true
            },
        }))
    }

    async function fetchAccountBalance(accId: number) {
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            sqlArgs: {
                branchId: isAllBranches ? null : branchId,
                accId: accId,
                finYearId: finYearId,
            },
            sqlId: SqlIdsMap.getAccountBalance,
        })
        dispatch(updateLedgerSubledger({
            instance: instance,
            updates: {
                accountBalance: res?.[0]?.accountBalance || 0,
                hasError: false
            }
        }))
    }

    function handleOnChangeFirstSelect(e: any) {
        clearSecondSelect()
        if (!e) { // Clear button clicked
            setSecondSelectDisabled(true)
            dispatch(updateLedgerSubledger({
                instance: instance,
                updates: {
                    accountBalance: 0,
                    finalAccId: undefined,
                    subLedgerData: [],
                    hasError: true
                }
            }))
            return
        }
        if (e.accLeaf === 'Y') {
            setSecondSelectDisabled(true)
            dispatch(updateLedgerSubledger({
                instance: instance,
                updates: {
                    finalAccId: e.id,
                    hasError: false,
                    subLedgerData: []
                }
            }))
            fetchAccountBalance(e.id)
        } else {
            setSecondSelectDisabled(false)
            loadSecondSelectOptions(e.id) // load second select
            dispatch(updateLedgerSubledger({
                instance: instance,
                updates: {
                    accountBalance: 0,
                    finalAccId: undefined,
                    hasError: true,
                }
            }))
        }
    }

    function handleOnChangeSecondSelect(e: any) {
        if (!e) {
            return
        }
        dispatch(updateLedgerSubledger({
            instance: instance,
            updates: {
                hasError: false,
                finalAccId: e.id
            }
        }))
        fetchAccountBalance(e.id)
    }

    async function loadFirstSelectOptions() {
        const res: AccountType[] = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            sqlArgs: sqlArgs,
            sqlId: sqlId || SqlIdsMap.getLedgerLeafAccounts,
        })
        firstSelectRef.current.setValue(null)
        dispatch(updateLedgerSubledger({
            instance: instance,
            updates: {
                accountBalance: 0,
                finalAccId: undefined,
                hasError: true,
                ledgerandLeafData: res,
                subLedgerData: []
            }
        }))
    }

    async function loadSecondSelectOptions(accId: number) {
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            sqlArgs: {
                accId: accId
            },
            sqlId: SqlIdsMap.getSubledgerAccounts,
        })
        dispatch(updateLedgerSubledger({
            instance: instance,
            updates: {
                subLedgerData: res || [],
                hasError: true
            }
        }))
    }
}

type LedgerSubledgerType = {
    className?: string
    heading: string
    instance: string
    isAllBranches: boolean
    showAccountBalance: boolean
    sqlArgs?: SqlArgsType
    sqlId: string
}

type AccountType = {
    accLeaf: 'L' | 'Y'
    accName: string
    id: number
}