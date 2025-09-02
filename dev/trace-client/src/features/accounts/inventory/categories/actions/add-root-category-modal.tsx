import { useForm } from "react-hook-form";
import _ from "lodash";
import { useValidators } from "../../../../../utils/validators-hook";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { useEffect } from "react";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../../utils/ibuki";
import { IbukiMessages } from "../../../../../utils/ibukiMessages";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import { Messages } from "../../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../../controls/widgets/widget-button-submit-full-width";
import { XDataObjectType } from "../../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../../utils/utils";
import { AllTables } from "../../../../../app/maps/database-tables-map";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { WidgetFormHelperText } from "../../../../../controls/widgets/widget-form-helper-text";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";

export function AddRootCategoryModal() {
    const { checkNoSpecialChar } = useValidators()
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo()

    const {
        register,
        clearErrors,
        handleSubmit,
        setError,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<FormValuesType>({ mode: 'onTouched', criteriaMode: 'all' });

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-CATEGORY-NAME'], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('catName')
            if (isValid) {
                validateCatNameAtServer(d.data)
            }
        })

        return (() => {
            subs1.unsubscribe()
        })
    }, [])

    return (<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-auto min-w-72 gap-4">

        {/* Category Name */}
        <label className="flex flex-col font-medium text-primary-400">
            <span className="font-bold">Category Name <WidgetAstrix /></span>
            <input
                type="text"
                placeholder="e.g. Lifestyle Products"
                autoComplete="off"
                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic"
                {...register('catName', {
                    required: Messages.errRequired,
                    validate: {
                        validateCategoryName: checkNoSpecialChar
                    },
                    onChange: (e: any) => {
                        ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-CATEGORY-NAME'], { catName: e.target.value })
                    }
                })}
            />
            {errors.catName && <WidgetFormErrorMessage errorMessage={errors.catName.message} />}
        </label>

        {/* Descr */}
        <label className="flex flex-col font-medium text-primary-400">
            <span className="font-bold">Category Description</span>
            <input
                type="text"
                placeholder="e.g. Lifestyle Products Description"
                autoComplete="off"
                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic"
                {...register('descr')}
            />
        </label>

        {/* Submit Button */}
        <div className="flex justify-start mt-4">
            <WidgetButtonSubmitFullWidth label="Save" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
        </div>

        <span>
            {showServerValidationError()}
        </span>

    </form>)

    async function onSubmit(data: FormValuesType) {
        const xData: XDataObjectType = {}
        xData.catName = data.catName
        xData.descr = data.descr
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: AllTables.CategoryM.name,
                xData: xData
            })
            const loadData = context.CompSyncFusionTreeGrid[DataInstancesMap.productCategories].loadData
            if (loadData) {
                await loadData()
            }
            Utils.showSaveMessage();
            Utils.showHideModalDialogA({
                isOpen: false
            })
        } catch (e: any) {
            console.log(e)
        }
    }

    function showServerValidationError() {
        let Ret = <></>
        if (errors?.root?.catName) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.catName.message} />
        } else {
            Ret = <WidgetFormHelperText helperText='&nbsp;' />
        }
        return (Ret)
    }

    async function validateCatNameAtServer(value: { catName: string }) {
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.doesCatNameExist,
            sqlArgs: {
                catName: value?.catName
            }
        })
        if (res?.[0]?.exists) {
            setError('root.catName', {
                type: 'serverError',
                message: Messages.errCatNameExists
            })
        } else {
            clearErrors('root.catName')
        }
    }
}

type FormValuesType = {
    catName: string
    descr: string
    hsn?: number
    isLeaf: boolean
    parentId?: number
    tagId?: number
};