import { useForm } from "react-hook-form";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import { Messages } from "../../../../../utils/messages";
import { useValidators } from "../../../../../utils/validators-hook";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { WidgetFormErrorMessage } from "../../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../../controls/widgets/widget-button-submit-full-width";
import { Utils } from "../../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../../app/graphql/maps/database-tables-map";
import { DataInstancesMap } from "../../../../../app/graphql/maps/data-instances-map";
import { useEffect } from "react";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../../utils/ibuki";
import { IbukiMessages } from "../../../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { WidgetFormHelperText } from "../../../../../controls/widgets/widget-form-helper-text";
import clsx from "clsx";

export function EditCategoryModal({ catName, descr, hasChildRecords, id, isLeaf, isUsed }: EditChildCategoryModalType) {
    const { checkNoSpecialChar } = useValidators();
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();

    const {
        clearErrors,
        register,
        handleSubmit,
        setError,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<FormValuesType>({
        mode: "onTouched",
        defaultValues: { catName, descr, id, isLeaf },  // Prefill form with existing category data
    });

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

    // useEffect(() => {
    //     // Set default form values when modal opens
    //     setValue("catName", catName);
    //     setValue("descr", descr);
    //     setValue("isLeaf", isLeaf);
    // }, [catName, descr, isLeaf, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-auto min-w-72">
            {/* Category Name */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Category Name <WidgetAstrix /></span>
                <input
                    type="text"
                    autoComplete="off"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:italic"
                    {...register("catName", {
                        required: Messages.errRequired,
                        validate: { validateCategoryName: checkNoSpecialChar },
                        onChange: (e: any) => {
                            ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-CATEGORY-NAME'], { catName: e.target.value })
                        }
                    })}
                />
                {errors.catName && <WidgetFormErrorMessage errorMessage={errors.catName.message} />}
            </label>

            {/* Description */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Category Description</span>
                <input
                    type="text"
                    autoComplete="off"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:italic"
                    {...register("descr")}
                />
            </label>

            {/* Is Leaf Checkbox */}
            <label className={clsx((hasChildRecords || isUsed) ? 'opacity-40 cursor-default' : 'opacity-100 cursor-pointer', "flex items-center font-medium text-primary-400")}>
                <input type="checkbox" className="mr-2" {...register("isLeaf")} disabled={hasChildRecords || isUsed} />
                <span className="font-bold">Is Leaf Category</span>
            </label>

            {/* Submit*/}
            <WidgetButtonSubmitFullWidth label="Update" disabled={isSubmitting} />

            <span>
                {showServerValidationError()}
            </span>
        </form>
    );

    function onClose() {
        Utils.showHideModalDialogA({
            isOpen: false
        })
    }

    async function onSubmit(data: FormValuesType) {
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || "",
                tableName: DatabaseTablesMap.CategoryM,
                xData: {
                    catName: data.catName,
                    descr: data.descr,
                    id: id,
                    isLeaf: data.isLeaf,
                },
            });

            // Refresh category list after update
            const loadData = context.CompSyncFusionTreeGrid[DataInstancesMap.productCategories]?.loadData;
            if (loadData) await loadData();

            Utils.showSaveMessage();
            onClose(); // Close modal after saving

        } catch (e: any) {
            console.error(e);
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
            sqlId: SqlIdsMap.doesOtherCatNameExist,
            sqlArgs: {
                id: id,
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
    id: number;  // Required to identify the category
    catName: string;
    descr: string;
    isLeaf: boolean;
};

type EditChildCategoryModalType = {
    catName: string; // Required
    descr: string;
    hasChildRecords: boolean;
    id: number;
    isLeaf: boolean;
    isUsed: boolean;
}