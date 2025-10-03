import { useContext, useEffect, } from "react"
import _ from 'lodash'
import { useValidators } from "../../../../utils/validators-hook"
import { useForm } from "react-hook-form"
import { GlobalContext, GlobalContextType } from "../../../../app/global-context"
import { Messages } from "../../../../utils/messages"
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki"
import { IbukiMessages } from "../../../../utils/ibukiMessages"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map"
import { Utils } from "../../../../utils/utils"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text"
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"
import { AllTables } from "../../../../app/maps/database-tables-map"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"

export function SuperAdminNewEditClientExtDatabase({
    clientCode
    , clientName
    , dataInstance
    , dbName
    , dbParams
    , id
    , isActive = false
    , isExternalDb
}: SuperAdminNewEditClientExtDatabaseType) {
    const {checkIpAddress, checkNoSpaceOrSpecialChar, checkNoSpaceOrSpecialCharAllowDot, checkNoSpecialChar, checkUrl, shouldBePositive, shouldNotBeZero } = useValidators()
    const { clearErrors, handleSubmit, register, setError, setValue, getValues, trigger, formState: { errors, }, } = useForm<FormDataType>({
        mode: 'onTouched', criteriaMode: 'firstError',
    })
    const context: GlobalContextType = useContext(GlobalContext)

    const registerClientCode = register('clientCode'
        , {
            maxLength: { value: 30, message: Messages.errAtMost30Chars },
            minLength: { value: 6, message: Messages.errAtLeast6Chars },
            required: Messages.errRequired,
            validate: {
                noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar,
            },
            onChange: (e: any) => {
                ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-CLIENT-CODE'], { clientCode: e.target.value })
            }
        }
    )

    const registerClientName = register('clientName'
        , {
            required: Messages.errRequired,
            minLength: { value: 6, message: Messages.errAtLeast6Chars },
            maxLength: { value: 50, message: Messages.errAtMost50Chars },
            validate: {
                noSpecialChar: checkNoSpecialChar
            },
            onChange: (e: any) => {
                ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-CLIENT-NAME'], { clientName: e.target.value })
            }
        })

    const registerIsClientActive = register('isActive')

    const registerDbName = register('dbName', {
        required: Messages.errRequired,
        minLength: { value: 6, message: Messages.errAtLeast6Chars },
        validate: {
            noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar,
        }
    })

    const registerHost = register('host', {
        required: Messages.errRequired
        , validate: {
            noSpaceOrSpecialChar: checkNoSpaceOrSpecialCharAllowDot
        }
    })

    const registerUser = register('user', {
        minLength: { value: 4, message: Messages.errAtLeast4Chars },
        required: Messages.errRequired
        , validate: {
            noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar
        }
    })

    const registerPassword = register('password', {
        minLength: { value: 4, message: Messages.errAtLeast4Chars },
        required: Messages.errRequired
    })

    const registerInternalPort = register('internalPort', {
        required: Messages.errRequired
        , validate: {
            shouldNotBeZero: shouldNotBeZero,
            shouldBePositive: shouldBePositive
        }
    })

    const registerIpAddress = register('ipAddress', {
        required: Messages.errRequired
        , validate: {
            validIpAddress: checkIpAddress
        }
    })



    const registerPort = register('port', {
        required: Messages.errRequired
        , validate: {
            shouldNotBeZero: shouldNotBeZero,
            shouldBePositive: shouldBePositive
        }
    })
    const registerUrl = register('url', {
        validate: {
            urlType: checkUrl
        }
    })

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-CLIENT-CODE'], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('clientCode')
            if (isValid) {
                validateClientCodeAtServer(d.data)
            }
        })
        const subs2 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-CLIENT-NAME"], 1600).subscribe(async (d: any) => {
            const isValid = await trigger('clientName')
            if (isValid) {
                validateClientNameAtServer(d.data)
            }
        })
        populateValues() // useful for edit purpose
        return (() => {
            subs1.unsubscribe()
            subs2.unsubscribe()
        })
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col w-auto min-w-80 text-xs gap-2'>

                {/* Client code */}
                <label className='flex flex-col font-medium text-primary-400 gap-1'>
                    <span className='font-bold'>Client code <WidgetAstrix /></span>
                    <input type='text' placeholder="e.g battle" autoComplete="off"
                        className='px-2 h-8 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs'
                        {...registerClientCode}
                    />
                    <span className="flex justify-between">
                        {(errors.clientCode)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientCode.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        <TooltipComponent content={Messages.messClientCode} className="text-blue-500! text-sm bg-white border -top-5!">
                            <span className='ml-auto text-primary-400 text-xs cursor-pointer'>?</span>
                        </TooltipComponent>
                    </span>
                </label>

                {/* Client name */}
                <label className='flex flex-col font-medium text-primary-400 gap-1'>
                    <span className='font-bold'>Client name <WidgetAstrix /></span>
                    <input type='text' placeholder="e.g Battle ground" autoComplete="off"
                        className='px-2 h-8 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerClientName}
                    />
                    <span className="flex justify-between">
                        {(errors.clientName)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientName.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        <TooltipComponent content={Messages.messClientName} className="text-blue-500! text-sm bg-white border -top-5!">
                            <span className='ml-auto text-primary-400 text-xs cursor-pointer'>?</span>
                        </TooltipComponent>
                    </span>
                </label>

                {/* Is active  */}
                <div className="flex items-center">
                    <input type="checkbox" id='isActive' className='w-4 h-4 cursor-pointer'
                        {...registerIsClientActive} />
                    <label htmlFor="isActive" className="ml-2 text-primary-500 cursor-pointer">Is this client active</label>
                </div>

                {/* External database details */}
                <div className="flex flex-col p-1 w-full bg-slate-100 gap-1">
                    <label className="font-bold text-primary-500 text-xs">External database connection details</label>

                    {/* db name and host */}
                    <div className="flex w-auto gap-1">
                        {/* db name */}
                        <label className='flex flex-col w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB name <WidgetAstrix /></span>
                            <input type='text' placeholder="e.g Battle_database" autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerDbName}
                            />
                            <span className="flex justify-between">
                                {(errors.dbName)
                                    ? <WidgetFormErrorMessage errorMessage={errors.dbName.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>

                        {/* db host */}
                        <label className='flex flex-col pr-1 w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB host <WidgetAstrix /></span>
                            <input type='text' placeholder="e.g host name" autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerHost} />
                            <span className="flex justify-between">
                                {(errors.host)
                                    ? <WidgetFormErrorMessage errorMessage={errors.host.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>
                    </div>

                    {/* User name and password */}
                    <div className="flex w-auto gap-1">
                        <label className='flex flex-col w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB user name <WidgetAstrix /></span>
                            <input type='text' autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerUser} />
                            <span className="flex justify-between">
                                {(errors.user)
                                    ? <WidgetFormErrorMessage errorMessage={errors.user.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>

                        <label className='flex flex-col pr-1 w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB password <WidgetAstrix /></span>
                            <input type='password' autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerPassword} />
                            <span className="flex justify-between">
                                {(errors.password)
                                    ? <WidgetFormErrorMessage errorMessage={errors.password.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>
                    </div>

                    {/* DB port and DB url */}
                    <div className="flex w-auto gap-1">
                        <label className='flex flex-col w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB public port <WidgetAstrix /></span>
                            <input type='number' autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerPort} />
                            <span className="flex justify-between">
                                {(errors.port)
                                    ? <WidgetFormErrorMessage errorMessage={errors.port.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>

                        <label className='flex flex-col pr-1 w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB url </span>
                            <input type='text' autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerUrl} />
                            <span className="flex justify-between">
                                {(errors.url)
                                    ? <WidgetFormErrorMessage errorMessage={errors.url.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>
                    </div>

                    {/* IP address and internal port */}
                    <div className="flex w-auto gap-1">
                        <label className='flex flex-col w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB IP address <WidgetAstrix /></span>
                            <input type='text' autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerIpAddress} />
                            <span className="flex justify-between">
                                {(errors.ipAddress)
                                    ? <WidgetFormErrorMessage errorMessage={errors.ipAddress.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>
                        <label className='flex flex-col pr-1 w-1/2 font-medium text-primary-400 gap-1'>
                            <span className='font-bold text-xs'>DB internal port <WidgetAstrix /></span>
                            <input type='number' autoComplete="off"
                                className='px-2 h-7 border border-primary-200 rounded-md placeholder:italic placeholder:text-slate-400 placeholder:text-xs' {...registerInternalPort} />
                            <span className="flex justify-between">
                                {(errors.internalPort)
                                    ? <WidgetFormErrorMessage errorMessage={errors.internalPort.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}
                            </span>
                        </label>
                    </div>

                    <button type="button" onClick={handleTestDbConnection}
                        disabled={isDbValidationErrors()}
                        className="ml-auto px-2 w-max h-7 text-white text-xs bg-lime-600 rounded-md hover:bg-lime-700 active:shadow-primary-2 disabled:bg-slate-300">
                        Test database connection
                    </button>
                </div>

                {/* Save */}
                <div className='flex justify-start'>
                    <WidgetButtonSubmitFullWidth label='Save' disabled={!_.isEmpty(errors)} />
                </div>
                <span>
                    {showServerValidationError()}
                </span>
            </div>
        </form>
    )
    function populateValues() {
        setValue('clientCode', clientCode || '')
        setValue('clientName', clientName || '')
        setValue('dbName', dbName || '')
        setValue('id', id)
        setValue('isActive', isActive || false)
        setValue('isExternalDb', isExternalDb || true)

        setValue('host', dbParams?.host)
        setValue('password', dbParams?.password)
        setValue('port', dbParams?.port)
        setValue('user', dbParams?.user)
        setValue('url', dbParams?.url)
        setValue('ipAddress', dbParams?.ipAddress || '')
        setValue('internalPort', dbParams?.internalPort || 5432)
    }

    async function handleTestDbConnection() {
        const ret = await trigger(['dbName', 'host', 'user', 'password', 'port', 'internalPort', 'ipAddress'])
        if (!ret) {
            return
        }
        const data: FormDataType = getValues()
        const dbParams = {
            dbname: data.dbName, // 'tra', // its dbname and not dbName
            host: data.host, // 'node',
            user: data.user, // 'web',
            password: data.password, // 'K',
            port: data.port, //1
            internalPort: data.internalPort, // 5432,
            ipAddress: data.ipAddress, // '
        }
        try {
            const q: any = GraphQLQueriesMap.genericQuery(data.dbName, {
                sqlId: SqlIdsMap.testConnection,
                dbParams: dbParams
            })
            const queryName: string = GraphQLQueriesMapNames.genericQuery
            const res: any = await Utils.queryGraphQL(q, queryName)
            if (res?.data?.[queryName]?.[0]?.connection) {
                Utils.showSuccessAlertMessage({ message: Messages.messDbConnSuccessful, title: Messages.messSuccess },)
            } else {
                Utils.showFailureAlertMessage({ message: Messages.messDbConnFailure, title: Messages.messFailure })
            }
        } catch (e: any) {
            Utils.showFailureAlertMessage({ message: Messages.messDbConnFailure, title: Messages.messFailure })
            console.log(e)
        }
    }

    function isDbValidationErrors() {
        const ret: any = errors.dbName
            || errors.host
            || errors.user
            || errors.password
            || errors.port
            || errors.url
            || errors.internalPort
            || errors.ipAddress

        return (ret)
    }

    async function onSubmit(data: FormDataType) {
        const dbName1: string = data.dbName || `${data.clientCode}_accounts` // If dbname is already there, it does not change
        const dbParams: any = {
            dbname: dbName1, // In dbParams it is dbname and not dbName
            host: data?.host,
            user: data?.user,
            password: data?.password,
            port: +data?.port,
            url: data?.url,
            internalPort: +data?.internalPort || 5432, // Default port is 5432
            ipAddress: data?.ipAddress || ''
        }
        const traceDataObject: TraceDataObjectType = {
            tableName: AllTables.ClientM.name // When id is present then considered as update
            , xData: {
                id: data?.id
                , clientCode: data?.clientCode
                , clientName: data?.clientName
                , dbName: dbName1
                , isActive: data.isActive
                , isExternalDb: true
                , dbParams: JSON.stringify(dbParams)
            }
        }
        try {
            const q: any = GraphQLQueriesMap.updateClient(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject)
            const queryName: string = GraphQLQueriesMapNames.updateClient
            await Utils.mutateGraphQL(q, queryName)
            Utils.showHideModalDialogA({
                isOpen: false,
            })
            context.CompSyncFusionGrid[dataInstance].loadData()
        } catch (e: any) { // Error handling allready done in mutateGraphQL
            console.log(e)
        }
    }

    function showServerValidationError() {
        let Ret = <></>
        if (errors?.root?.clientCode) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.clientCode.message} />
        } else if (errors?.root?.clientName) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.clientName.message} />
        } else {
            Ret = <WidgetFormHelperText helperText='&nbsp;' />
        }
        return (Ret)
    }

    async function validateClientCodeAtServer(value: any) {
        const res: any = await Utils.queryGraphQL(
            GraphQLQueriesMap.genericQuery(
                GLOBAL_SECURITY_DATABASE_NAME
                , {
                    sqlId: SqlIdsMap.getClientOnClientCode
                    , sqlArgs: { clientCode: value?.clientCode }
                })
            , GraphQLQueriesMapNames.genericQuery)
        if (res?.data?.genericQuery[0]) {
            setError('root.clientCode', {
                type: 'serverError',
                message: Messages.errClientCodeExists
            })
        } else {
            clearErrors('root.clientCode')
        }
    }

    async function validateClientNameAtServer(value: any) {
        const res: any = await Utils.queryGraphQL(
            GraphQLQueriesMap.genericQuery(
                GLOBAL_SECURITY_DATABASE_NAME
                , {
                    sqlId: SqlIdsMap.getClientOnClientName
                    , sqlArgs: { clientName: value?.clientName }
                })
            , GraphQLQueriesMapNames.genericQuery)
        if (res?.data?.genericQuery[0]) {
            setError('root.clientName', {
                type: 'serverError',
                message: Messages.errClientNameExists
            })
        } else {
            clearErrors('root.clientName')
        }
    }
}

type FormDataType = {
    clientCode: string
    clientName: string
    dbName: string
    id?: string
    internalPort: number
    ipAddress: string
    isActive: boolean
    isExternalDb?: boolean
    host: string
    user: string
    password: string
    port: number
    url: string
}

type SuperAdminNewEditClientExtDatabaseType = {
    dataInstance: string
    clientCode?: string
    clientName?: string
    dbName?: string
    dbParams?: any
    id?: string
    isActive?: boolean
    isExternalDb?: boolean
}