import { useForm } from "react-hook-form"
import _ from 'lodash'
import { Messages } from "../../../../utils/messages"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"
import { useContext, useEffect, useState } from "react"
import { useValidators } from "../../../../utils/validators-hook"
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"
import { Utils } from "../../../../utils/utils"
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki"
import { GlobalContext, GlobalContextType } from "../../../../app/global-context"
import { IbukiMessages } from "../../../../utils/ibukiMessages"
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map"
import { AllTables } from "../../../../app/maps/database-tables-map"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"

export function SuperAdminNewEditClient({
    clientCode
    , clientName
    , dataInstance
    , dbName
    , id
    , isActive
    , isExternalDb
}: SuperAdminNewEditClientType) {
    const [active, setActive] = useState(isActive || false)
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar } = useValidators()
    const { clearErrors, handleSubmit, register, setError, setValue, trigger, formState: { errors, }, } = useForm<FormDataType>({
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
            <div className='flex flex-col w-auto min-w-72 gap-2'>

                {/* Client code */}
                <label className='flex flex-col font-medium text-primary-400'>
                    <span className='font-bold'>Client code <WidgetAstrix /></span>
                    <input type='text' placeholder="e.g battle" autoComplete="off"
                        className='px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs'
                        {...registerClientCode}
                    />
                    <span className="flex justify-between">
                        {(errors.clientCode)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientCode.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        <TooltipComponent content={Messages.messClientCode} className="font-normal text-blue-500! text-sm bg-white border-2 border-gray-200 -top-5!">
                            <span className='ml-auto text-primary-400 text-xs hover:cursor-pointer'>?</span>
                        </TooltipComponent>
                    </span>
                </label>

                {/* Client name */}
                <label className='flex flex-col font-medium text-primary-400'>
                    <span className='font-bold'>Client name <WidgetAstrix /></span>
                    <input type='text' placeholder="e.g Battle ground" autoComplete="off"
                        className='px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs'
                        {...registerClientName}
                    />
                    <span className="flex justify-between">
                        {(errors.clientName)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientName.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        <TooltipComponent content={Messages.messClientName} className="font-normal text-blue-500! text-sm bg-white border-2 border-gray-200 -top-5!">
                            <span className='ml-auto text-primary-400 text-xs hover:cursor-pointer'>?</span>
                        </TooltipComponent>
                    </span>
                </label>

                {/* Is active  */}
                <div className="flex items-center">
                    <input type="checkbox" id='isActive' className='w-4 h-4 cursor-pointer'
                        checked={active}  {...registerIsClientActive} onChange={() => setActive(!active)} />
                    <label htmlFor="isActive" className="ml-3 text-primary-500 text-sm cursor-pointer">Is this client active</label>
                </div>

                {/* Save */}
                <div className='flex justify-start mt-4'>
                    <WidgetButtonSubmitFullWidth label='Save' disabled={!_.isEmpty(errors)} />
                </div>
            
                <span>
                    {showServerValidationError()}
                </span>
            </div>
        </form>
    )

    async function onSubmit(data: FormDataType) {
        const dbName1: string = data.dbName || `${data.clientCode}_accounts` // If dbname is already there, it does not change
        const traceDataObject: TraceDataObjectType = {
            tableName: AllTables.ClientM.name
            , xData: {
                ...data
                , dbName: dbName1
                , isExternalDb: false
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
    isActive: boolean
    isExternalDb?: boolean
}

type SuperAdminNewEditClientType = {
    dataInstance: string
    clientCode?: string | undefined
    clientName?: string
    dbName?: string
    dbParams?: string
    id?: string
    isActive?: boolean
    isExternalDb?: boolean
}