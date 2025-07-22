
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { useForm } from "react-hook-form";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import { Messages } from "../../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../../controls/widgets/widget-button-submit-full-width";
import { Utils } from "../../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../../app/maps/database-tables-map";
import { useValidators } from "../../../../../utils/validators-hook";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { WidgetFormHelperText } from "../../../../../controls/widgets/widget-form-helper-text";
import { useEffect } from "react";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../../utils/ibuki";
import { IbukiMessages } from "../../../../../utils/ibukiMessages";
import _ from "lodash";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";

export function NewEditTagModal({ id, tagName, instance }: NewEditTagType) {
    const { checkNoSpecialChar } = useValidators()
    const { buCode, dbName, decodedDbParamsObject, context } = useUtilsInfo();

    const {
        clearErrors,
        register,
        trigger,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        setError
    } = useForm<NewEditTagType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: { id, tagName },
    });

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-TAG-NAME'], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('tagName')
            if (isValid) {
                validateTagNameAtServer(d.data)
            }
        })

        return (() => {
            subs1.unsubscribe()
        })
    }, [])

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-y-4 w-96 mt-2 mb-2">

            {/* Tag Name */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">
                    Tag Name <WidgetAstrix />
                </span>
                <input
                    type="text"
                    placeholder="e.g. Urgent"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register("tagName", {
                        required: Messages.errRequired,
                        validate: {
                            validateCategoryName: checkNoSpecialChar
                        },
                        onChange: (e: any) => {
                            ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-TAG-NAME'], { tagName: e.target.value })
                        }
                    })}
                />
                {errors.tagName && (
                    <WidgetFormErrorMessage errorMessage={errors.tagName.message} />
                )}
            </label>

            {/* Submit */}
            <WidgetButtonSubmitFullWidth
                label="Submit"
                className="max-w-96 mt-2"
                disabled={isSubmitting || !isDirty || (!_.isEmpty(errors))}
            />

            <span>
                {showServerValidationError()}
            </span>
        </form>
    );

    async function onSubmit(data: NewEditTagType) {
        const tagValue = data.tagName // getValues('tagName')
        if (!isDirty) {
            Utils.showAlertMessage("Warning", Messages.messNothingToDo);
            return;
        }
        if (await validateTagNameAtServer({ tagName: tagValue })) {
            return
        }

        try {
            await Utils.doGenericUpdate({
                buCode: buCode || "",
                tableName: DatabaseTablesMap.TagsM,
                xData: { id: data.id, tagName: data.tagName },
            });
            Utils.showSaveMessage();
            Utils.showHideModalDialogB({ isOpen: false });
            const loadData = context.CompSyncFusionGrid[instance].loadData;
            if (loadData) {
                await loadData();
            }
            const loadData1 = context.CompSyncFusionTreeGrid[DataInstancesMap.productCategories].loadData
            if (loadData1) {
                await loadData1();
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    function showServerValidationError() {
        let Ret = <></>
        if (errors?.root?.tagName) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.tagName.message} />
        } else {
            Ret = <WidgetFormHelperText helperText='&nbsp;' />
        }
        return (Ret)
    }

    async function validateTagNameAtServer(value: { tagName: string }) {

        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: id ? SqlIdsMap.doesOtherTagNameExist : SqlIdsMap.doesTagNameExist,
            sqlArgs: {
                tagName: value?.tagName,
                id: id
            }
        })
        if (res?.[0]?.exists) {
            setError('root.tagName', {
                type: 'serverError',
                message: Messages.errTagNameExists
            })
        } else {
            clearErrors('root.tagName')
        }
        return (res?.[0]?.exists)
    }
}

export type NewEditTagType = {
    id?: number;
    tagName: string;
    instance: string
};
