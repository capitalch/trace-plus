import Select from 'react-select'
import { ReduxComponentsInstances } from "./redux-components-instances"
import clsx from 'clsx'
import { useQueryHelper } from '../../app/graphql/query-helper-hook'
import { BusinessUnitType, currentBusinessUnitSelectorFn, UserDetailsType } from '../../features/login/login-slice'
import { Utils } from '../../utils/utils'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { SqlIdsMap } from '../../app/graphql/maps/sql-ids-map'
import { AppDispatchType, RootStateType } from '../../app/store/store'
import { WidgetLoadingIndicator } from '../widgets/widget-loading-indicator'
import { reduxCompLedgerSubledgerDataForSubledgerFn, setReduxCompLedgerSubledgerDataForSubledger, setReduxCompLedgerSubledgerFinalAccId, setReduxCompLedgerSubledgerLedgerAccId } from './redux-comp-slice'
import { GraphQLQueriesMap } from '../../app/graphql/maps/graphql-queries-map'
import { SqlArgsType } from '../components/generic-syncfusion-grid/comp-syncfusion-grid'

export function ReduxCompLedgerSubledger({
    className,
    sqlArgs,
    sqlId
}: ReduxCompLedgerSubledgerType) {
    const instance: string = ReduxComponentsInstances.reduxCompLedgerSubledgerGeneralLedger
    const dispatch: AppDispatchType = useDispatch()
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const currentBusinessUnit: BusinessUnitType = useSelector(
        currentBusinessUnitSelectorFn, shallowEqual
    ) || {}
    const ledgerOrLeafAccounts: any = useSelector((state: RootStateType) =>
        state.queryHelper[instance]?.data)
    const subledgerData: any = useSelector((state: RootStateType) => reduxCompLedgerSubledgerDataForSubledgerFn(state, instance))

    const { dbName, decodedDbParamsObject, } = userDetails
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
    return (<div className={clsx('flex flex-col w-60', className)} >
        <Select
            getOptionLabel={(e: AccountType) => e.accLeaf === 'Y' ? e.accName : `${e.accName} >>>`}
            getOptionValue={(e: AccountType) => e.id.toString()}
            // isClearable={true}
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
            // isClearable={true}
            maxMenuHeight={150}
            onChange={handleOnChangeSecondSelect}
            placeholder='Select subledger account'
            styles={getStyles()}
            options={subledgerData || []}
        />
    </div>)

    function handleOnChangeFirstSelect(e: any) {
        if (e.accLeaf === 'Y') {
            dispatch(setReduxCompLedgerSubledgerFinalAccId({
                instance: instance,
                finalAccId: e.id,
            }))
            dispatch(setReduxCompLedgerSubledgerDataForSubledger({
                instance: instance,
                subLedgerData: []
            }))
        } else {
            loadSecondSelectOptions(e.id) // load second select
        }
    }

    function handleOnChangeSecondSelect(e: any) {
        dispatch(setReduxCompLedgerSubledgerLedgerAccId({
            instance: instance,
            finalAccId: e.id,
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
                    subLedgerData: res?.data?.[GraphQLQueriesMap.genericQuery.name] || []
                }
            ))
    }

    function getStyles() {
        return ({
            input: (defaultStyles: any) => ({
                ...defaultStyles,
                minWidth: '15rem',
                "input:focus": {
                    boxShadow: "none",
                },
            }),
            option: (defaultStyles: any, state: any) => ({
                ...defaultStyles,
                paddingTop: '2px',
                paddingBottom: '2px',
                fontSize: '14px',
                fontWeight: state?.data?.accLeaf === 'L' ? 'bold' : 'normal'
            }),
        })
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