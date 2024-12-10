import Select, { components } from 'react-select'
import { ReduxComponentsInstances } from "./redux-components-instances"
import clsx from 'clsx'
import { useQueryHelper } from '../../app/graphql/query-helper-hook'
import { BusinessUnitType, currentBusinessUnitSelectorFn, UserDetailsType } from '../../features/login/login-slice'
import { Utils } from '../../utils/utils'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { SqlIdsMap } from '../../app/graphql/maps/sql-ids-map'
import { AppDispatchType, RootStateType } from '../../app/store/store'
import { WidgetLoadingIndicator } from '../widgets/widget-loading-indicator'
import { reduxCompLedgerSubledgerDataForSubledgerFn, reduxCompLedgerSubledgerLedgerHasErrorFn, setReduxCompLedgerSubledgerDataForSubledger, setReduxCompLedgerSubledgerFinalAccId, setReduxCompLedgerSubledgerHasError, setReduxCompLedgerSubledgerLedgerAccId } from './redux-comp-slice'
import { GraphQLQueriesMap } from '../../app/graphql/maps/graphql-queries-map'
import { SqlArgsType } from '../components/generic-syncfusion-grid/comp-syncfusion-grid'
import { useRef, useState } from 'react'

export function ReduxCompLedgerSubledger({
    className,
    sqlArgs,
    sqlId
}: ReduxCompLedgerSubledgerType) {
    const instance: string = ReduxComponentsInstances.reduxCompLedgerSubledgerGeneralLedger
    const dispatch: AppDispatchType = useDispatch()
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
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
    const isError: boolean |undefined = useSelector((state: RootStateType) => reduxCompLedgerSubledgerLedgerHasErrorFn(state, instance))

    const { loading, /*loadData*/ } = useQueryHelper({ // Load data for first select
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
    // `${isError ? 'border-2 border-red-500' : 'border-none'}`
    return (<div className={clsx('flex flex-col w-60', className, `${isError ? 'border-4 border-red-500' : 'border-none'}`)} >
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

    function handleOnChangeFirstSelect(e: any) {
        clearSecondSelect()
        if (!e) { // Clear button clicked
            setSecondSelectDisabled(true)
            dispatch(setReduxCompLedgerSubledgerDataForSubledger({
                instance: instance,
                subLedgerData: [],
                hasError: false
            }))
            return
        }
        if (e.accLeaf === 'Y') {
            setSecondSelectDisabled(true)
            dispatch(setReduxCompLedgerSubledgerFinalAccId({
                instance: instance,
                finalAccId: e.id,
                hasError: false
            }))
            dispatch(setReduxCompLedgerSubledgerDataForSubledger({
                instance: instance,
                subLedgerData: [],
                hasError: false,
            }))
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
    }

    async function loadSecondSelectOptions(accId: number) {
        const res: any = await Utils.queryGraphQL(
            GraphQLQueriesMap.genericQuery(dbName || '', {
                buCode: currentBusinessUnit.buCode,
                dbParams: decodedDbParamsObject,
                sqlArgs: {
                    accId: accId
                },
                sqlId: SqlIdsMap.getSubledgerAccounts
            }), GraphQLQueriesMap.genericQuery.name
        )
        dispatch(
            setReduxCompLedgerSubledgerDataForSubledger(
                {
                    instance: instance,
                    hasError: true,
                    subLedgerData: res?.data?.[GraphQLQueriesMap.genericQuery.name] || []
                }
            ))
    }
}

type ReduxCompLedgerSubledgerType = {
    className?: string
    sqlArgs?: SqlArgsType
    sqlId: string
}

type AccountType = {
    accLeaf: 'L' | 'Y'
    accName: string
    id: number
}