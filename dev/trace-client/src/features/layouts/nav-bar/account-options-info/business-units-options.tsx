import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { BusinessUnitType, currentBusinessUnitSelectorFn, doLogout, LoginType, setCurrentDateFormat, setDecodedDbParamsObject, setFinYearsBranchesAccSettings, UserDetailsType } from "../../../login/login-slice"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { Utils } from "../../../../utils/utils"
import { BusinessUnitsListModal } from "./business-units-list-modal"
import { useEffect, } from "react"
import { AppDispatchType, RootStateType } from "../../../../app/store/store"
import { Messages } from "../../../../utils/messages"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"

export function BusinessUnitsOptions() {
    const dispatch: AppDispatchType = useDispatch()
    const currentBusinessUnitSelector: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const selectAccSettingsChanged = useSelector((state: RootStateType) => state.accounts.accSettingsChanged) // to reload this component when accSettings like unitInfo changes

    useEffect(() => {
        if (currentBusinessUnitSelector.buCode) {
            fetchAccDetails()
        }
    }, [currentBusinessUnitSelector, selectAccSettingsChanged])

    return (
        <TooltipComponent content={currentBusinessUnitSelector?.buName || ''} position="LeftCenter" key={String(selectAccSettingsChanged)}>
            <button onClick={handleOnClickBusinessUnit} className="flex h-8 w-50 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow-sm">

                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    BU
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    {currentBusinessUnitSelector?.buCode || ''}
                </span>
            </button>
        </TooltipComponent>
    )

    async function fetchAccDetails() {
        const userDetails: UserDetailsType = loginInfo.userDetails || {}
        const dbName: string = userDetails.dbName || ''
        const isExternalDb: boolean = userDetails.isExternalDb || false
        const dbParams: string | undefined = userDetails?.dbParams
        let dbParamsObject: any
        if (isExternalDb && dbParams) {
            dbParamsObject = await Utils.decodeExtDbParams(dbParams)
            dispatch(setDecodedDbParamsObject(dbParamsObject))
        }
        // If there is no current business unit then show message and logout
        if (!loginInfo?.currentBusinessUnit?.buCode) {
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.messNoBusinessUnitsDefined })
            dispatch(doLogout())
            return
        }
        try {
            const q = GraphQLQueriesMap.genericQuery(dbName, {
                buCode: loginInfo.currentBusinessUnit?.buCode,
                dbParams: dbParamsObject,
                sqlId: SqlIdsMap.getSettingsFinYearsBranches,
                sqlArgs: {}
            });
            const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMap.genericQuery.name);
            const result: any = res?.data?.genericQuery?.[0]?.jsonResult
            if (result) {
                dispatch(setFinYearsBranchesAccSettings({ accSettings: result?.allSettings, finYears: result.allFinYears, branches: result.allBranches }))
                dispatch(setCurrentDateFormat('DD/MM/YYYY'))
            }
            // clean up content area and reset side menu by deselecting any menu item
            // navigate('/')
            // dispatch(setSideBarSelectedChildId({ id: '0' }))
        } catch (e: any) {
            console.log(e?.message)
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errFailFetchingDataFromAccounts })
            dispatch(doLogout())
        }
    }

    function handleOnClickBusinessUnit() {
        Utils.showHideModalDialogA({
            className: 'ml-2',
            title: "Select a business unit",
            isOpen: true,
            element: <BusinessUnitsListModal />,
        })
    }
}