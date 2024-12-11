import Select, { components } from 'react-select'
import { ReduxComponentsInstances } from "./redux-components-instances"
import clsx from 'clsx'
import { useQueryHelper } from '../../app/graphql/query-helper-hook'
import { BranchType, BusinessUnitType, currentBusinessUnitSelectorFn, FinYearType, UserDetailsType } from '../../features/login/login-slice'
import { Utils } from '../../utils/utils'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { SqlIdsMap } from '../../app/graphql/maps/sql-ids-map'
import { AppDispatchType, RootStateType } from '../../app/store/store'
import { WidgetLoadingIndicator } from '../widgets/widget-loading-indicator'
import { reduxCompLedgerSubledgerAccountBalancedFn, reduxCompLedgerSubledgerDataForSubledgerFn, reduxCompLedgerSubledgerFinalAccIdFn, reduxCompLedgerSubledgerLedgerHasErrorFn, setReduxCompLedgerSubledgerAccountBalance, setReduxCompLedgerSubledgerDataForSubledger, setReduxCompLedgerSubledgerFinalAccId, setReduxCompLedgerSubledgerHasError, setReduxCompLedgerSubledgerLedgerAccId } from './redux-comp-slice'
import { GraphQLQueriesMap } from '../../app/graphql/maps/graphql-queries-map'
import { SqlArgsType } from '../components/generic-syncfusion-grid/comp-syncfusion-grid'
import { useRef, useState } from 'react'
import { IconRefresh } from '../icons/icon-refresh'
import { TooltipComponent } from '@syncfusion/ej2-react-popups'

export function ReduxCompLedgerSubledger({
    className,
    heading = '',
    isAllBranches = false,
    showAccountBalance = false,
    sqlArgs,
    sqlId
}: ReduxCompLedgerSubledgerType) {
    const instance: string = ReduxComponentsInstances.reduxCompLedgerSubledgerGeneralLedger
    const dispatch: AppDispatchType = useDispatch()
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const currentFinYear: FinYearType = Utils.getCurrentLoginInfo().currentFinYear || Utils.getCurrentFinYear()
    const currentBranch: BranchType | undefined = Utils.getCurrentLoginInfo().currentBranch
    const [isSecondSelectDisabled, setSecondSelectDisabled] = useState(true)
    const { dbName, decodedDbParamsObject, } = userDetails
    const secondSelectRef: any = useRef(null)

    // Selectors
    const currentBusinessUnit: BusinessUnitType = useSelector(
        currentBusinessUnitSelectorFn, shallowEqual
    ) || {}
    const ledgerOrLeafAccounts: any = useSelector((state: RootStateType) =>
        state.queryHelper[instance]?.data)
    const subledgerData: any = useSelector((state: RootStateType) => reduxCompLedgerSubledgerDataForSubledgerFn(state, instance))
    const hasError: boolean | undefined = useSelector((state: RootStateType) => reduxCompLedgerSubledgerLedgerHasErrorFn(state, instance))
    const accountBalance: number = useSelector((state: RootStateType) => reduxCompLedgerSubledgerAccountBalancedFn(state, instance))

    const decimalFormatter: any = Utils.getDecimalFormatter()
    const { loading, loadData } = useQueryHelper({ // Load data for first select
        instance: instance,
        isExecQueryOnLoad: true,
        dbName: dbName,
        getQueryArgs: () => ({
            buCode: currentBusinessUnit.buCode,
            dbParams: decodedDbParamsObject,
            sqlId: sqlId || SqlIdsMap.getLedgerLeafAccounts,
            sqlArgs: sqlArgs
        })
    })

    if (loading) {
        return (<WidgetLoadingIndicator className='ml-6 mt-6' />)
    }

    return (<div className={clsx('flex flex-col w-60', className,)} >

        {/* Header */}
        <div className='h-6 bg-slate-50 flex text-sm items-center'>
            <label className='font-medium text-primary-400'>{heading}</label>
            <TooltipComponent className='ml-auto mt-2' content='Refresh' position='RightCenter'>
                <button onClick={loadData}>
                    <IconRefresh className='text-blue-500 h-5 w-5' />
                </button>
            </TooltipComponent>
            <span className='ml-auto'>
                <label className='font-medium text-blue-400'>{decimalFormatter.format(Math.abs(accountBalance))}</label>
                <label className={clsx(((accountBalance < 0) ? 'text-red-500' : 'text-blue-400'), 'font-bold')}>{(accountBalance < 0) ? ' Cr' : ' Dr'}</label>
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
                options={ledgerOrLeafAccounts}
                placeholder='Select account'
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

    async function fetchAccountBalance(accId: number) {
        const res: any = await Utils.doGenericQuery({
            buCode: currentBusinessUnit.buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            sqlArgs: {
                branchId: isAllBranches ? undefined : currentBranch?.branchId,
                accId: accId,
                finYearId: currentFinYear?.finYearId,
            },
            sqlId: SqlIdsMap.getAccountBalance,
        })
        dispatch(setReduxCompLedgerSubledgerAccountBalance({
            instance: instance,
            accountBalance: res?.[0].accountBalance || 0,
            hasError: false
        }))
        console.log(res)
    }

    function handleOnChangeFirstSelect(e: any) {
        clearSecondSelect()
        if (!e) { // Clear button clicked
            setSecondSelectDisabled(true)
            dispatch(setReduxCompLedgerSubledgerDataForSubledger({
                instance: instance,
                subLedgerData: [],
                hasError: true
            }))
            return
        }
        if (e.accLeaf === 'Y') {
            setSecondSelectDisabled(true)
            dispatch(setReduxCompLedgerSubledgerFinalAccId({
                instance: instance,
                finalAccId: e.id,
                hasError: false,
                subLedgerData: [],
            }))
            fetchAccountBalance(e.id)
        } else {
            setSecondSelectDisabled(false)
            loadSecondSelectOptions(e.id) // load second select
            dispatch(setReduxCompLedgerSubledgerHasError({ instance: instance, hasError: true }))
        }
    }

    function handleOnChangeSecondSelect(e: any) {
        if (!e) {
            return
        }
        dispatch(setReduxCompLedgerSubledgerLedgerAccId({
            instance: instance,
            finalAccId: e.id,
            hasError: false
        }))
        fetchAccountBalance(e.id)
    }

    async function loadSecondSelectOptions(accId: number) {
        const res: any = await Utils.doGenericQuery({
            buCode: currentBusinessUnit.buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            sqlArgs: {
                accId: accId
            },
            sqlId: SqlIdsMap.getSubledgerAccounts,
        })
        dispatch(
            setReduxCompLedgerSubledgerDataForSubledger(
                {
                    instance: instance,
                    hasError: true,
                    subLedgerData: res || []
                }
            ))
    }
}

type ReduxCompLedgerSubledgerType = {
    className?: string
    heading: string
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