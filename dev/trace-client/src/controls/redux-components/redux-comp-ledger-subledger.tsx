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
import { setReduxCompLedgerSubledgerFinalAccId, setReduxCompLedgerSubledgerLedgerAccId } from './redux-comp-slice'
import { ChangeEvent } from 'react'
import { GraphQLQueriesMap } from '../../app/graphql/maps/graphql-queries-map'

export function ReduxCompLedgerSubledger({
    className
}: ReduxCompLedgerSubledgerType) {
    const instance: string = ReduxComponentsInstances.reduxCompLedgerSubledgerGeneralLedger
    const dispatch: AppDispatchType = useDispatch()
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const ledgerOrLeafAccounts: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data)


    const { dbName, decodedDbParamsObject, } = userDetails
    const { loading, loadData } = useQueryHelper({
        instance: instance,
        isExecQueryOnLoad: true,
        dbName: dbName,
        getQueryArgs: () => ({
            buCode: currentBusinessUnit.buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getLedgerLeafAccounts
        })
    })
    if (loading) {
        return (<WidgetLoadingIndicator className='ml-6 mt-6' />)
    }
    return (<div className={clsx('flex flex-col w-60', className)} >
        <Select
            // formatOptionLabel={(e: AccountType) => {
            //     let accName = (e.accLeaf === 'L') ? `${e.accName} >>>` : e.accName
            //     return (<label className={`${(e.accLeaf === 'L') ? 'font-bold' : 'font-normal'}`}>{accName}</label>)
            // }}
            getOptionLabel={(e: AccountType) => e.accName}
            getOptionValue={(e: AccountType) => e.id.toString()}
            isClearable={true}
            // isSearchable={true}
            onChange={handleOnChangeFirstSelect}
            options={ledgerOrLeafAccounts} 
            placeholder='Select account' />
        <Select
            isClearable={true}
            onChange={handleOnChangeSecondSelect}
            placeholder='Select subledger account '
        // options={subledgerAccounts}
        />
    </div>)

    function handleOnChangeFirstSelect(e: any) {
        if (e.accLeaf === 'Y') {
            dispatch(setReduxCompLedgerSubledgerFinalAccId({
                instance: instance,
                finalAccId: e.id,
                ledgerAccId: undefined,
                subLedgerData: []
            }))
        } else {
            // load second select
            loadSecondSelectOptions(e.id)
            // dispatch(setReduxCompLedgerSubledgerLedgerAccId({
            //     instance: instance,
            //     finalAccId: undefined,
            //     ledgerAccId: e.id,
            //     subLedgerData: []
            // }))
        }
    }

    function handleOnChangeSecondSelect(e: any) {
        dispatch(setReduxCompLedgerSubledgerLedgerAccId({
            instance: instance,
            finalAccId: e.id,
            // ledgerAccId: undefined
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
        console.log(res?.data)
    }
}

type ReduxCompLedgerSubledgerType = {
    className?: string
}

type AccountType = {
    accLeaf: 'L' | 'Y'
    accName: string
    id: number
}