import { useForm } from "react-hook-form"
import _ from 'lodash'
import { Messages } from "../../../../utils/messages"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"
import { WidgetTooltip } from "../../../../controls/widgets/widget-tooltip"
import { useContext, useEffect, useState } from "react"
import { useValidators } from "../../../../utils/validators-hook"
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"
import { Utils } from "../../../../utils/utils"
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki"
import { GlobalContextType } from "../../../../app/global-context"
import { GlobalContext } from "../../../../App"
import { IbukiMessages } from "../../../../utils/ibukiMessages"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"

export function SuperAdminEditNewClient({
    clientCode
    , clientName
    , dataInstance
    , dbName
    , id
    , isActive
    , isExternalDb
}: SuperAdminEditNewClientType) {
    const [active, setActive] = useState(isActive || false)
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar } = useValidators()
    const { clearErrors, handleSubmit, register, setError, setValue, formState: { errors, }, } = useForm<FormDataType>({
        mode: 'onTouched'
        , criteriaMode: 'firstError'
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

    const registerClientName = register('clientName', {
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

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-CLIENT-CODE'], 1200).subscribe((d: any) => {
            validateClientCodeAtServer(d.data)
        })
        const subs2 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-CLIENT-NAME"], 1600).subscribe((d: any) => {
            validateClientNameAtServer(d.data)
        })
        setValue('clientCode', clientCode || '')
        setValue('clientName', clientName || '')
        setValue('dbName', dbName || '')
        setValue('id', id)
        setValue('isActive', isActive || false)
        setValue('isExternalDb', isExternalDb || false)

        return (() => {
            subs1.unsubscribe()
            subs2.unsubscribe()
        })
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-2 w-auto min-w-72'>

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
                        <WidgetTooltip title={Messages.messClientCode} className="font-normal text-sm !-top-5 bg-white !text-blue-500 border-gray-200 border-2">
                            <span className='ml-auto text-xs text-primary-400 hover:cursor-pointer'>?</span>
                        </WidgetTooltip>
                    </span>
                </label>

                {/* Client name */}
                <label className='flex flex-col font-medium text-primary-400'>
                    <span className='font-bold'>Client name <WidgetAstrix /></span>
                    <input type='text' placeholder="e.g Battle ground" autoComplete="off"
                        className='rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic'
                        {...registerClientName}
                    />
                    <span className="flex justify-between">
                        {(errors.clientName)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientName.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        <WidgetTooltip title={Messages.messClientName} className="font-normal text-sm !-top-5 bg-white !text-blue-500 border-gray-200 border-2">
                            <span className='ml-auto text-xs text-primary-400 hover:cursor-pointer'>?</span>
                        </WidgetTooltip>
                    </span>
                </label>

                {/* Is active  */}
                <div className="flex items-center">
                    <input type="checkbox" id='isActive' className='h-4 w-4 cursor-pointer'
                        checked={active}  {...registerIsClientActive} onChange={() => setActive(!active)} />
                    <label htmlFor="isActive" className="ml-3 text-sm text-primary-500 cursor-pointer">Is this client active</label>
                </div>

                {/* Save */}
                <div className='mt-4 flex justify-start'>
                    <WidgetButtonSubmitFullWidth label='Save' disabled={!_.isEmpty(errors)} />
                </div>
                {/* <button type="button" onClick={() => {
                    console.log(errors)
                }}>Test</button> */}
                <span>
                    {showServerValidationError()}
                </span>
            </div>
        </form>
    )

    async function onSubmit(data: FormDataType) {
        const dbName1: string = data.dbName || `${data.clientCode}_accounts` // If dbname is already there, it does not change
        const traceDataObject: TraceDataObjectType = {
            tableName: 'ClientM'
            , xData: {
                ...data
                , dbName: dbName1
                , isExternalDb: false
            }
        }
        try {
            const q: any = GraphQLQueriesMap.updateClient(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject)
            const queryName: string = GraphQLQueriesMap.updateClient.name
            await Utils.mutateGraphQL(q, queryName)
            Utils.showHideModalDialogA({
                isOpen: false,
            })
            context.CompSyncFusionGrid[dataInstance].loadData()
        } catch (e: any) { // Error handling allready done in mutateGraphQL
            console.log(e.message)
        } finally {
            Utils.showAppLoader(false)
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
            , GraphQLQueriesMap.genericQuery.name)
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
            , GraphQLQueriesMap.genericQuery.name)
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
}

type SuperAdminEditNewClientType = {
    dataInstance: string
    clientCode?: string | undefined
    clientName?: string
    dbName?: string
    dbParams?: string
    id?: string
    isActive?: boolean
    isExternalDb?: boolean
}