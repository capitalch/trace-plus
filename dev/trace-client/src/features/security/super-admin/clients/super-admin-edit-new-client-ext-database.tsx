import { useContext, useEffect, useState } from "react"
import _ from 'lodash'
import { useValidators } from "../../../../utils/validators-hook"
import { useForm } from "react-hook-form"
import { GlobalContextType } from "../../../../app/global-context"
import { GlobalContext } from "../../../../App"
import { Messages } from "../../../../utils/messages"
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki"
import { IbukiMessages } from "../../../../utils/ibukiMessages"
import { MapGraphQLQueries } from "../../../../app/graphql/maps/map-graphql-queries"
import { Utils } from "../../../../utils/utils"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"
import { MapSqlIds } from "../../../../app/graphql/maps/map-sql-ids"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text"
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
import { WidgetTooltip } from "../../../../controls/widgets/widget-tooltip"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"

export function SuperAdminEditNewClientExtDatabase({
    clientCode
    , clientName
    , dataInstance
    , dbName
    , id
    , isActive = false
    , isExternalDb
}: SuperAdminEditNewClientExtDatabaseType) {
    const [active, setActive] = useState(false)
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar, checkUrl, shouldBePositive, shouldNotBeZero } = useValidators()
    const { clearErrors, handleSubmit, register, setError, setValue, getValues, /*getValues, getFieldState,*/ trigger, formState: { errors, }, } = useForm<FormDataType>({
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
            noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar
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

    const registerPort = register('port', {
        required: Messages.errRequired
        , validate: {
            // onlyNumeric: checkNumeric,
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
        const subs1 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-CLIENT-CODE'], 1200).subscribe((d: any) => {
            validateClientCodeAtServer(d.data)
        })
        const subs2 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-CLIENT-NAME"], 1600).subscribe((d: any) => {
            validateClientNameAtServer(d.data)
        })
        // Following code for edit purpose
        setValue('clientCode', clientCode || '')
        setValue('clientName', clientName || '')
        setValue('dbName', dbName || '')
        setValue('id', id)
        setValue('isActive', isActive || false)
        setValue('isExternalDb', isExternalDb || true)

        return (() => {
            subs1.unsubscribe()
            subs2.unsubscribe()
        })
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex w-auto min-w-80 flex-col gap-2'>

                {/* Client code */}
                <label className='flex flex-col font-medium text-primary-400'>
                    <span className='font-bold'>Client code <WidgetAstrix /></span>
                    <input type='text' placeholder="e.g battle" autoComplete="off"
                        className='rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic'
                        {...registerClientCode}
                    />
                    <span className="flex justify-between">
                        {(errors.clientCode)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientCode.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        <WidgetTooltip title={Messages.messClientCode} className="!-top-5 border-2 border-gray-200 bg-white text-sm font-normal !text-blue-500">
                            <span className='ml-auto text-xs text-primary-400 hover:cursor-pointer'>?</span>
                        </WidgetTooltip>
                    </span>
                </label>

                {/* Client name */}
                <label className='flex flex-col font-medium text-primary-400'>
                    <span className='font-bold'>Client name <WidgetAstrix /></span>
                    <input type='text' placeholder="e.g Battle ground" autoComplete="off"
                        className='rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic' {...registerClientName}
                    />
                    <span className="flex justify-between">
                        {(errors.clientName)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientName.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        <WidgetTooltip title={Messages.messClientName} className="!-top-5 border-2 border-gray-200 bg-white text-sm font-normal !text-blue-500">
                            <span className='ml-auto text-xs text-primary-400 hover:cursor-pointer'>?</span>
                        </WidgetTooltip>
                    </span>
                </label>

                {/* Is active  */}
                <div className="flex items-center">
                    <input type="checkbox" id='isActive' className='h-4 w-4 cursor-pointer'
                        checked={active}  {...registerIsClientActive} onChange={() => setActive(!active)} />
                    <label htmlFor="isActive" className="ml-3 cursor-pointer text-sm text-primary-500">Is this client active</label>
                </div>

                {/* External database details */}
                <div className="flex w-full flex-col bg-slate-100 p-2">
                    <label className="text-sm font-bold text-primary-500">External database connection details</label>

                    {/* db name and host */}
                    <div className="mt-1 flex w-auto gap-2">

                        {/* db name */}
                        <label className='flex w-1/2 flex-col gap-1 font-medium text-primary-400'>
                            <span className='text-xs font-bold'>DB name <WidgetAstrix /></span>
                            <input type='text' placeholder="e.g Battle_database" autoComplete="off"
                                className='h-8 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic' {...registerDbName}
                            />
                            <span className="flex justify-between">
                                {(errors.dbName)
                                    ? <WidgetFormErrorMessage errorMessage={errors.dbName.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}

                            </span>
                        </label>

                        {/* db host */}
                        <label className='flex w-1/2 flex-col gap-1 pr-2 font-medium text-primary-400'>
                            <span className='text-xs font-bold'>DB host <WidgetAstrix /></span>
                            <input type='text' placeholder="e.g host name" autoComplete="off"
                                className='h-8 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic'
                                {...registerHost}
                            />
                            <span className="flex justify-between">
                                {(errors.host)
                                    ? <WidgetFormErrorMessage errorMessage={errors.host.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}

                            </span>
                        </label>
                    </div>

                    {/* User name and password */}
                    <div className="mt-1 flex w-auto gap-2">

                        {/* db User name */}
                        <label className='flex w-1/2 flex-col gap-1 font-medium text-primary-400'>
                            <span className='text-xs font-bold'>DB user name <WidgetAstrix /></span>
                            <input type='text' autoComplete="off"
                                className='h-8 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic'
                                {...registerUser}
                            />
                            <span className="flex justify-between">
                                {(errors.user)
                                    ? <WidgetFormErrorMessage errorMessage={errors.user.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}

                            </span>
                        </label>

                        {/* db password */}
                        <label className='flex w-1/2 flex-col gap-1 pr-2 font-medium text-primary-400'>
                            <span className='text-xs font-bold'>DB password <WidgetAstrix /></span>
                            <input type='password' autoComplete="off"
                                className='h-8 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic'
                                {...registerPassword}
                            />
                            <span className="flex justify-between">
                                {(errors.password)
                                    ? <WidgetFormErrorMessage errorMessage={errors.password.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}

                            </span>
                        </label>
                    </div>

                    {/* DB port and DB url */}
                    <div className="mt-1 flex w-auto gap-2">

                        {/* db port */}
                        <label className='flex w-1/2 flex-col gap-1 font-medium text-primary-400'>
                            <span className='text-xs font-bold'>DB port <WidgetAstrix /></span>
                            <input type='number' autoComplete="off"
                                className='h-8 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic'
                                {...registerPort}
                            />
                            <span className="flex justify-between">
                                {(errors.port)
                                    ? <WidgetFormErrorMessage errorMessage={errors.port.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}

                            </span>
                        </label>

                        {/* db url */}
                        <label className='flex w-1/2 flex-col gap-1 pr-2 font-medium text-primary-400'>
                            <span className='text-xs font-bold'>DB url </span>
                            <input type='text' autoComplete="off"
                                className='h-8 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic'
                                {...registerUrl}
                            />
                            <span className="flex justify-between">
                                {(errors.url)
                                    ? <WidgetFormErrorMessage errorMessage={errors.url.message} />
                                    : <WidgetFormHelperText helperText='&nbsp;' />}

                            </span>
                        </label>
                    </div>
                    <button type="button" onClick={handleTestDbConnection}
                        disabled={isDbValidationErrors()}
                        className="ml-auto mt-1 h-7 w-max rounded-md bg-lime-600 px-2 text-xs text-white hover:bg-lime-700 disabled:bg-slate-300 active:shadow-primary-2">Test database connection</button>
                </div>

                {/* Save */}
                <div className='mt-4 flex justify-start'>
                    <WidgetButtonSubmitFullWidth label='Save' disabled={!_.isEmpty(errors)} />
                </div>
                <button type="button" className="bg-slate-300" onClick={handleTestDbConnection}>Test conn</button>
                <span>
                    {showServerValidationError()}
                </span>
            </div>
        </form>
    )


    async function handleTestDbConnection() {
        const ret = await trigger(['dbName', 'host', 'user', 'password', 'port'])
        if (!ret) {
            // return
        }
        const data: any = getValues()
        console.log(data)
        const dbParams = {
            dbName: 'tra',
            host: 'node150',
            user: 'w',
            password: 'K',
            port: 11
        }
        try {
            const q: any = MapGraphQLQueries.genericQuery(dbParams.dbName, {
                sqlId: MapSqlIds.testConnection,
                ...dbParams
            })
            const queryName: string = MapGraphQLQueries.genericQuery.name
            const res: any = await Utils.queryGraphQL(q, queryName)
            if (res?.data?.[queryName]?.[0]?.connection) {
                Utils.showSuccessAlertMessage({ message: Messages.messDbConnSuccessful, title: Messages.messSuccess })
            } else {
                Utils.showFailureAlertMessage({ message: Messages.messDbConnFailure, title: Messages.messFailure })
            }
        } catch (e: any) {
            Utils.showFailureAlertMessage({ message: Messages.messDbConnFailure, title: Messages.messFailure })
            console.log(e.message)
        }
    }

    function isDbValidationErrors() {
        const ret: any = errors.dbName
            || errors.host
            || errors.user
            || errors.password
            || errors.port
            || errors.url

        return (ret)
    }

    async function onSubmit(data: FormDataType) {
        const dbName1: string = data.dbName || `${data.clientCode}_accounts` // If dbname is already there, it does not change
        const dbParams: any = {
            dbName: dbName1,
            host: data?.host,
            user: data?.user,
            password: data?.password,
            port: +data?.port,
            url: data?.url
        }
        const traceDataObject: TraceDataObjectType = {
            tableName: 'ClientM'
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
            const q: any = MapGraphQLQueries.updateClient(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject)
            const queryName: string = MapGraphQLQueries.updateClient.name
            // console.log(q, queryName)
            await Utils.mutateGraphQL(q, queryName)
            Utils.showHideModalDialogA({
                isOpen: false,
            })
            context.CompSyncFusionGrid[dataInstance].loadData()
        } catch (e: any) { // Error handling allready done in mutateGraphQL
            console.log(e.message)
        } finally {
            // Utils.showAppLoader(false)
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
            MapGraphQLQueries.genericQuery(
                GLOBAL_SECURITY_DATABASE_NAME
                , {
                    sqlId: MapSqlIds.getClientOnClientCode
                    , sqlArgs: { clientCode: value?.clientCode }
                })
            , MapGraphQLQueries.genericQuery.name)
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
            MapGraphQLQueries.genericQuery(
                GLOBAL_SECURITY_DATABASE_NAME
                , {
                    sqlId: MapSqlIds.getClientOnClientName
                    , sqlArgs: { clientName: value?.clientName }
                })
            , MapGraphQLQueries.genericQuery.name)
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
    isActive: boolean
    isExternalDb?: boolean
    host: string
    user: string
    password: string
    port: number
    url: string
}

type SuperAdminEditNewClientExtDatabaseType = {
    dataInstance: string
    clientCode?: string
    clientName?: string
    dbName?: string
    dbParams?: string
    id?: string
    isActive: boolean
    isExternalDb?: boolean
}

// const data: any = getValues()

// const isEmpty: boolean = _.isEmpty(data.dbName)
//     && _.isEmpty(data.host)
//     && _.isEmpty(data.user)
//     && _.isEmpty(data.password)
//     && _.isEmpty(data.port)

// const isInValiduserName = getFieldState('user').invalid
// const isInValidpassword = getFieldState('password').invalid
// const isInValidPort = getFieldState('port').invalid
// trigger(['dbName', 'host', 'user', 'password', 'port'])