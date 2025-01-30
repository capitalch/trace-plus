import Swal from "sweetalert2"
import dayjs from 'dayjs'
import _ from "lodash"
import { RootStateType, store } from "../app/store/store"
import { Messages } from "./messages"
import { ReactElement } from "react"
import { ibukiEmit } from "./ibuki"
import { IbukiMessages } from "./ibukiMessages"
import { getApolloClient } from "../app/graphql/apollo-client"
import { AccSettingType, BranchType, FinYearType, LoginType, UserDetailsType } from "../features/login/login-slice"
import { GraphQLQueriesMap, GraphQLUpdateArgsType } from "../app/graphql/maps/graphql-queries-map"
import { showCompAppLoader } from "../controls/redux-components/comp-slice"
import { CompInstances } from "../controls/redux-components/comp-instances"
import { treeGridUtils, TreeGridUtilsType } from "./tree-grid-utils"
import { gridUtils, GridUtilsType } from "./grid-utils"
import { GlobalContextType } from "../app/global-context"

export const Utils: UtilsType = {
    addUniqueKeysToJson: addUniqueKeysToJson,
    decodeExtDbParams: decodeExtDbParams,
    doGenericDelete: doGenericDelete,
    doGenericQuery: doGenericQuery,
    doGenericUpdate: doGenericUpdate,
    doGenericUpdateQuery: doGenericUpdateQuery,
    getCompanyName: getCompanyName,
    getCurrentBranch: getCurrentBranch,
    getCurrentDateFormat: getCurrentDateFormat,
    getCurrentFinYearFormattedDateRange: getCurrentFinYearFormattedDateRange,
    getCurrentLoginInfo: getCurrentLoginInfo,
    getDbNameDbParams: getDbNameDbParams,
    getDecimalFormatter: getDecimalFormatter,
    getGeneralSettings: getGeneralSettings,
    getHostUrl: getHostUrl,
    getIntegerFormatter: getIntegerFormatter,
    getReduxState: getReduxState,
    getRunningFinYear: getRunningFinYear,
    getRunningFinYearId: getRunningFinYearId,
    getToken: getToken,
    getUnitInfo: getUnitInfo,
    getUserDetails: getUserDetails,
    gridUtils: gridUtils,
    isNotNullOrUndefined: isNotNullOrUndefined,
    loadDataInTreeGridWithSavedScrollPos: loadDataInTreeGridWithSavedScrollPos,
    mutateGraphQL: mutateGraphQL,
    queryGraphQL: queryGraphQL,
    showAlertMessage: showAlertMessage,
    showConfirmDialog: showConfirmDialog,
    showCustomMessage: showCustomMessage,
    showDeleteConfirmDialog: showDeleteConfirmDialog,
    showErrorMessage: showErrorMessage,
    showFailureAlertMessage: showFailureAlertMessage,
    showHideModalDialogA: showHideModalDialogA,
    showHideModalDialogB: showHideModalDialogB,
    showGraphQlErrorMessage: showGraphQlErrorMessage,
    showOptionsSelect: showOptionsSelect,
    showSaveMessage: showSaveMessage,
    showSuccessAlertMessage: showSuccessAlertMessage,
    toDecimalFormat: toDecimalFormat,
    treeGridUtils: treeGridUtils
}

// function addUniqueKeysToJson1(data: any) { // Created by AI
//     let runningKey = 100000; // This is child series

//     const traverseAndAddKeys = (node: any, parentKey: number) => {
//         // Add a running key to child nodes, but the parent keeps the same key
//         const nodeWithKey = { ...node, pkey: parentKey };

//         // Traverse through child nodes if present
//         Object.keys(nodeWithKey).forEach((key) => {
//             if (Array.isArray(nodeWithKey[key])) {
//                 // Children will have unique running keys
//                 nodeWithKey[key] = nodeWithKey[key].map((child: any) => traverseAndAddKeys(child, runningKey++));
//             } else if (typeof nodeWithKey[key] === 'object' && nodeWithKey[key] !== null) {
//                 nodeWithKey[key] = traverseAndAddKeys(nodeWithKey[key], runningKey++);
//             }
//         });

//         return nodeWithKey;
//     };

//     return data.map((item: any, index: number) => {
//         // Assign a consistent parent key based on index or some stable property
//         const parentKey = index + 1; // Can also be item.id if available
//         return traverseAndAddKeys(item, parentKey);
//     });

// }

function addUniqueKeysToJson(data: any) { // AI created
    let runningKey = 100000; // Start of child series

    const traverseAndAddKeys = (node: any, parentKey: number) => {
        // Mutate the node by adding a pkey
        node.pkey = parentKey;

        // Traverse through child nodes if present
        Object.keys(node).forEach((key) => {
            if (Array.isArray(node[key])) {
                // Mutate children by adding unique running keys
                node[key].forEach((child) => {
                    traverseAndAddKeys(child, runningKey++);
                });
            } else if (typeof node[key] === 'object' && node[key] !== null) {
                // Mutate nested objects
                traverseAndAddKeys(node[key], runningKey++);
            }
        });
    };

    // Mutate the top-level data array
    data.forEach((item: any, index: number) => {
        const parentKey = index + 1; // Assign a consistent parent key
        traverseAndAddKeys(item, parentKey);
    });

    return data; // Return the mutated data
}

async function decodeExtDbParams(encodedDbParams: string) {
    const q = GraphQLQueriesMap.decodeExtDbParams(encodedDbParams)
    const qName = GraphQLQueriesMap.decodeExtDbParams.name
    try {
        const res: any = await Utils.queryGraphQL(q, qName)
        const dbParamsString = res?.data?.[qName]
        const dbParams: object = JSON.parse(dbParamsString)
        if (_.isEmpty(dbParams)) {
            throw new Error(Messages.errExtDbParamsFormatError)
        }
        return (dbParams)
    } catch (e: any) {
        Utils.showErrorMessage(e)
    }
}

async function doGenericDelete({ buCode, tableName, deletedIds }: DoGenericDeleteType) {
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const { dbName, decodedDbParamsObject, } = userDetails
    const traceDataObject: GraphQLUpdateArgsType = {
        tableName: tableName,
        dbParams: decodedDbParamsObject,
        buCode: buCode,
        deletedIds: deletedIds,
    }
    const q: any = GraphQLQueriesMap.genericUpdate(
        dbName || '',
        traceDataObject
    )
    const queryName: string = GraphQLQueriesMap.genericUpdate.name
    const res: any = await mutateGraphQL(q, queryName)
    return (res)
}

async function doGenericQuery({
    buCode
    , dbName
    , dbParams
    , instance
    , sqlArgs
    , sqlId
}: DoGenericQueryType) {
    const res: any = await queryGraphQL(
        GraphQLQueriesMap.genericQuery(
            dbName || '', {
            buCode: buCode,
            dbParams: dbParams,
            sqlArgs: sqlArgs,
            sqlId: sqlId
        }), GraphQLQueriesMap.genericQuery.name, instance)
    return (res?.data?.[GraphQLQueriesMap.genericQuery.name])
}

async function doGenericUpdate({ buCode, tableName, xData }: DoGenericUpdateType) {
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const { dbName, decodedDbParamsObject, } = userDetails
    const traceDataObject: GraphQLUpdateArgsType = {
        tableName: tableName,
        dbParams: decodedDbParamsObject,
        xData: xData,
        buCode: buCode,
    }
    const q: any = GraphQLQueriesMap.genericUpdate(
        dbName || '',
        traceDataObject
    )
    const queryName: string = GraphQLQueriesMap.genericUpdate.name
    const res: any = await mutateGraphQL(q, queryName)
    return (res)
}

async function doGenericUpdateQuery({
    buCode
    , dbName
    , dbParams
    // , instance
    , sqlArgs
    , sqlId
}: DoGenericUpdateQueryType) {
    const res: any = await mutateGraphQL(
        GraphQLQueriesMap.genericUpdateQuery(
            dbName || '', {
            buCode: buCode,
            dbParams: dbParams,
            sqlArgs: sqlArgs,
            sqlId: sqlId
        }), GraphQLQueriesMap.genericUpdateQuery.name)
    return (res?.data?.[GraphQLQueriesMap.genericUpdateQuery.name])
}

function getCompanyName(): string {
    const unitInfo: UnitInfoType | undefined = getUnitInfo()
    return (unitInfo?.unitName || '')
}

function getCurrentBranch(): BranchType | undefined {
    return (getCurrentLoginInfo().currentBranch)
}

function getCurrentDateFormat() {
    const accSettings: AccSettingType[] | undefined = getCurrentLoginInfo()?.accSettings
    const generalSettings: AccSettingType | undefined = accSettings?.find((s: AccSettingType) => s.key === 'generalSettings')
    const dateFormat: string = generalSettings?.jData?.dateFormat || 'dd/MM/YYYY'
    return (dateFormat)
}

function getCurrentFinYearFormattedDateRange() {
    const accSettings: AccSettingType[] | undefined = getCurrentLoginInfo()?.accSettings
    const generalSettings: AccSettingType | undefined = accSettings?.find((s: AccSettingType) => s.key === 'generalSettings')
    const dateFormat: string = generalSettings?.jData?.dateFormat || 'DD/MM/YYYY'
    const finYear: FinYearType = getCurrentLoginInfo().currentFinYear || getRunningFinYear()
    const startDate: string = dayjs(finYear.startDate).format(dateFormat)
    const endDate: string = dayjs(finYear.endDate).format(dateFormat)
    return (`${startDate} - ${endDate}`)
}

function getCurrentLoginInfo() {
    const reduxState: RootStateType = store.getState()
    return (reduxState.login)
}

function getDbNameDbParams(): DbNameDbParamsType {
    const loginInfo: LoginType = store.getState().login
    const userDetails: UserDetailsType = loginInfo?.userDetails || {}
    const dbNameDbParams: DbNameDbParamsType = {
        dbName: userDetails.dbName,
        dbParams: userDetails.decodedDbParamsObject
    }
    return (dbNameDbParams)
}

function getDecimalFormatter() {
    const formatter: any = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return (formatter)
}

function getGeneralSettings(): GeneralSettingsType {
    const accSettings: AccSettingType[] | undefined = getCurrentLoginInfo()?.accSettings
    const accSetting: AccSettingType | undefined = accSettings?.find((s: AccSettingType) => s.key === 'generalSettings')
    return (accSetting?.jData)
}

function getHostUrl() {
    let url: string
    if (import.meta.env.DEV) {
        url = import.meta.env['VITE_APP_LOCAL_SERVER_URL']
    } else {
        url = window.location.href
    }
    return (url)
}

function getIntegerFormatter() {
    const formatter: any = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return (formatter)
}

function getReduxState(): RootStateType {
    return (store.getState())
}

function getRunningFinYear(): FinYearType {
    const today = dayjs()
    const year: number = today.month() > 3 ? today.year() : today.year() - 1
    const startDate: string = `${year}-04-01`
    const endDate: string = `${year + 1}-03-31`
    return ({
        finYearId: year,
        startDate: startDate,
        endDate: endDate
    })
}

function getRunningFinYearId(): number {
    const today = dayjs()
    const year: number = today.month() > 3 ? today.year() : today.year() - 1
    return (year)
}

function getToken() {
    const state: RootStateType = store.getState();
    return (state.login.token)
}

function getUnitInfo(): UnitInfoType | undefined {
    const accSettings: AccSettingType[] | undefined = getCurrentLoginInfo()?.accSettings
    const accSetting: AccSettingType | undefined = accSettings?.find((s: AccSettingType) => s.key === 'unitInfo')
    return (accSetting?.jData)
}

function getUserDetails(): UserDetailsType | undefined {
    return (getCurrentLoginInfo().userDetails)
}

function isNotNullOrUndefined<T>(value: T | null | undefined): boolean {
    return ((value !== null) && (value !== undefined))
}

async function loadDataInTreeGridWithSavedScrollPos(context: GlobalContextType, instance: string) {
    const loadData = context.CompSyncFusionTreeGrid[instance].loadData
    const gridRef: any = context?.CompSyncFusionTreeGrid?.[instance]?.gridRef
    if (gridRef?.current) {
        treeGridUtils.saveScrollPos(context, instance)
    }
    if (loadData) {
        await loadData()
    }
}

async function mutateGraphQL(q: any, queryName: string) {
    try {
        store.dispatch(showCompAppLoader({
            instance: CompInstances.compAppLoader,
            isVisible: true
        }))
        const client = getApolloClient()
        const result: any = await client.mutate({
            mutation: q
        })
        const error: any = result?.data?.[queryName]?.error?.content
        if (error) {
            Utils.showGraphQlErrorMessage(error)
            throw error
        }
        showSaveMessage()
        return (result)
    } catch (e: any) {
        console.log(e)
        throw e
    }

    finally {
        store.dispatch(showCompAppLoader({
            instance: CompInstances.compAppLoader,
            isVisible: false
        }))
    }
}

async function queryGraphQL(q: any, queryName: string, instance?: string) {
    try {
        store.dispatch(showCompAppLoader({
            instance: instance || CompInstances.compAppLoader,
            isVisible: true
        }))
        const client = getApolloClient()
        const result: any = await client.query({
            query: q
        })
        const error: any = result?.data?.[queryName]?.error?.content
        if (error) {
            Utils.showGraphQlErrorMessage(error)
            throw error
        }
        return (result)
    } finally {
        store.dispatch(showCompAppLoader({
            instance: instance || CompInstances.compAppLoader,
            isVisible: false
        }))
    }
}

function showAlertMessage(title: string, message: string) {
    Swal.fire({
        title: title,
        text: message,
        icon: "info",
    })
}

function showConfirmDialog(title: string, message: string, onConfirm: () => void) {
    Swal.fire({
        title: title,
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed!"
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm()
        }
    })
}

function showCustomMessage(title: string) {
    Swal.fire({
        toast: true,
        position: "bottom-right",
        background: '#d0f0c0',
        timer: 5000,
        timerProgressBar: true,
        title: title,
        padding: '10px',
        showConfirmButton: false,
        icon: 'success',
        iconColor: '#007f5c',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
        width: '20rem'
    })
}

function showDeleteConfirmDialog(onConfirm: () => void) {
    Swal.fire({
        title: "Are you sure to delete?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed!"
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm()
        }
    })
}

function showErrorMessage(error?: any, errorCode?: string, errorMessage?: string): void {
    const errCode = error?.response?.data?.error_code || errorCode || error?.networkError?.result?.error_code || ''
    const errMessage = error?.response?.data?.message || errorMessage || error?.networkError?.result?.message || error?.message || Messages.errUnknown
    const status = error?.response?.status || error?.networkError?.statusCode || 500
    Swal.fire({
        // allowOutsideClick:true, // Does not work in toast mode
        toast: true,
        position: "bottom-right",
        color: "white",
        background: 'red',
        timer: 10000,
        timerProgressBar: true,
        title: `Error ${status}: ${errCode}: ${errMessage}`,
        padding: '10px',
        showConfirmButton: false,
        icon: 'error',
        iconColor: 'white',
        width: 'auto',
        showCloseButton: true,
        allowEscapeKey: true
    })
}

function showGraphQlErrorMessage(error: GraphQlErrorType) {
    Swal.fire({
        toast: true,
        position: "bottom-right",
        color: "white",
        background: 'red',
        timer: 50000,
        timerProgressBar: true,
        title: `Error ${error?.status_code}: ${error?.error_code}: ${error?.message}: ${error?.detail}`,
        padding: '10px',
        showConfirmButton: false,
        icon: 'error',
        iconColor: 'white',
        width: 'auto',
        showCloseButton: true,
    })
}

function showHideModalDialogA({ className, isOpen, title = '', element = <></> }: ShowHideModalDialogType) {
    const args: ShowModalDialogMessageArgsType = {
        className: className,
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: 'A'
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-A"], args)
}

function showHideModalDialogB({ isOpen, title = '', element = <></> }: ShowHideModalDialogType) {

    const args: ShowModalDialogMessageArgsType = {
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: 'B'
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-B"], args)

}

function showOptionsSelect(message: string, option1: string, option2: string, action: (result: any) => void) {
    Swal.fire({
        title: 'Select an option',
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: option1,
        cancelButtonText: 'Cancel',
        showDenyButton: true,
        denyButtonText: option2
    }).then(
        action
    );
}

function showSaveMessage() {
    Swal.fire({
        toast: true,
        position: "bottom-right",
        background: '#d0f0c0',
        timer: 5000,
        timerProgressBar: true,
        title: 'Operation successful',
        padding: '10px',
        showConfirmButton: false,
        icon: 'success',
        iconColor: '#007f5c',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
        width: '20rem'
    })
}

function showSuccessAlertMessage(alertMessage: AlertMessageType, callback?: () => void) {
    Swal.fire({
        title: alertMessage.title,
        text: alertMessage.message,
        icon: 'success'
    }).then(() => {
        if (callback) {
            callback()
        }
    })
}

function showFailureAlertMessage(alertMessage: AlertMessageType) {
    Swal.fire({
        title: alertMessage.title,
        text: alertMessage.message,
        icon: 'error'
    })
}

function toDecimalFormat(s: any) {
    s = s ?? ''
    if (s === '') {
        return s
    }
    if (typeof s !== 'string') {
        s = String(s)
    }
    let ret: string = s
    const v = Number(s)
    if (!isNaN(v)) {
        ret = v.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    }
    return ret
}

type AlertMessageType = {
    title: string
    message: string
}

export type GeneralSettingsType = {
    dateFormat: string
    autoLogoutTimeInMins: number | null
    auditLockDate: string | null
}

type GraphQlErrorType = {
    detail: string
    error_code: string
    status_code: number
    message: string
}

type ShowHideModalDialogType = {
    className?: string
    isOpen: boolean
    title?: string | undefined
    element?: ReactElement
}

type ShowModalDialogMessageArgsType = {
    className?: string
    title?: string | undefined
    isOpen: boolean
    element?: ReactElement
    instanceName: string
}

export type DbNameDbParamsType = {
    dbName: string | undefined
    dbParams?: { [key: string]: string | undefined }
}

export type DoGenericDeleteType = {
    buCode: string
    tableName: string
    deletedIds: string[] | number[]
}

export type DoGenericQueryType = {
    sqlId: string
    sqlArgs?: {
        [key: string]: any
    }
    buCode: string
    dbName: string
    dbParams?: {
        [key: string]: any
    }
    instance?: string
}

export type DoGenericUpdateType = {
    buCode: string
    tableName: string
    xData: Record<string, any>[] | Record<string, any>
}

export type DoGenericUpdateQueryType = {
    sqlId: string
    sqlArgs?: {
        [key: string]: any
    }
    buCode: string
    dbName: string
    dbParams?: {
        [key: string]: any
    }
    instance?: string
}

export type UnitInfoType = {
    email?: string
    gstin?: string
    pin?: string
    state?: string
    webSite?: string
    address1?: string
    address2?: string
    unitName?: string
    landPhone?: string
    shortName?: string
    mobileNumber?: string
}

type UtilsType = {
    addUniqueKeysToJson: (data: any) => any
    decodeExtDbParams: (encodedDbParams: string) => any
    doGenericDelete: ({ buCode, tableName, deletedIds }: DoGenericDeleteType) => any
    doGenericQuery: ({ sqlId
        , buCode
        , sqlArgs
        , dbName
        , dbParams
    }: DoGenericQueryType) => any
    doGenericUpdate: ({ buCode, tableName, xData }: DoGenericUpdateType) => any
    doGenericUpdateQuery: ({ sqlId
        , buCode
        , sqlArgs
        , dbName
        , dbParams
    }: DoGenericUpdateQueryType) => any
    getCompanyName: () => string
    getCurrentBranch: () => BranchType | undefined
    getCurrentDateFormat: () => string
    getCurrentFinYearFormattedDateRange: () => string
    getCurrentLoginInfo: () => LoginType
    getDbNameDbParams: () => DbNameDbParamsType
    getDecimalFormatter: () => any
    getGeneralSettings: () => GeneralSettingsType
    getHostUrl: () => string
    getIntegerFormatter: () => any
    getReduxState: () => RootStateType
    getRunningFinYear: () => FinYearType
    getRunningFinYearId: () => number
    getToken: () => string | undefined
    getUnitInfo: () => UnitInfoType | undefined
    isNotNullOrUndefined: (value: any) => boolean
    loadDataInTreeGridWithSavedScrollPos: (context: GlobalContextType, instance: string) => void
    getUserDetails: () => UserDetailsType | undefined
    gridUtils: GridUtilsType
    mutateGraphQL: (q: any, queryName: string) => any
    queryGraphQL: (q: any, queryName: string) => any
    showAlertMessage: (title: string, message: string) => void
    showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void
    showCustomMessage: (title: string) => void
    showDeleteConfirmDialog: (onConfirm: () => void) => void
    showFailureAlertMessage: (alertMessage: AlertMessageType) => void
    showSuccessAlertMessage: (alertMessage: AlertMessageType, callback?: () => void) => void
    showErrorMessage: (error?: any, errorCode?: string, errorMessage?: string) => void
    showHideModalDialogA: (options: ShowHideModalDialogType) => void
    showHideModalDialogB: (options: ShowHideModalDialogType) => void
    showGraphQlErrorMessage: (error: GraphQlErrorType) => void
    showOptionsSelect: (message: string, option1: string, option2: string, action: (result: any) => void) => void
    showSaveMessage: () => void
    toDecimalFormat: (s: any) => string
    treeGridUtils: TreeGridUtilsType
}

