import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useValidators } from "../../../../utils/validators-hook";
import { useForm } from "react-hook-form";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";
import { changeAccSettings } from "../../accounts-slice";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import Select from "react-select";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { useEffect } from "react";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { setQueryHelperData } from "../../../../app/graphql/query-helper-slice";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";

export function NewEditProduct({ id }: { id?: number }) {
    const instance: string = DataInstancesMap.productMaster;
    const dispatch: AppDispatchType = useDispatch();
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();
    const allBrandsCategoriesUnits = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.brandsCategoriesUnits]?.data)

    const {
        // checkNoSpecialChar
    } = useValidators();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<NewEditProductType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id: id,
            catId: undefined,
            brandId: undefined,
            unitId: undefined,
            label: undefined,
            hsn: undefined,
            upcCode: undefined,
            gstRate: 0,
            salePrice: 0,
            isActive: true,
            maxRetailPrice: 0,
            dealerPrice: 0,
            salePriceGst: 0,
            purPriceGst: 0,
            purPrice: 0,
            info: undefined
        },
    });

    useEffect(() => {
        // loadCategory()
    }, [])

    const { loading } = useQueryHelper({
        instance: DataInstancesMap.brandsCategoriesUnits,
        dbName: dbName,
        isExecQueryOnLoad: true,
        getQueryArgs: () => ({
            buCode: buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getBrandsCategoriesUnits
        })
    })

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-0.5">
            <form onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="p-4 space-y-6">
                    <div className="flex flex-col gap-4">

                        {/* category */}
                        <FormField label="Category" required error={errors.catId?.message}>
                            <CompReactSelect
                                menuPlacement="auto"
                                optionLabelName="catName"
                                optionValueName="id"
                                placeHolder="Select category ..."
                                ref={null}
                                staticOptions={allBrandsCategoriesUnits?.[0]?.jsonResult?.categories ?? []} //meta.current.rows
                                selectedValue={id}
                                onChange={handleOnChangeCategory}
                            />
                        </FormField>

                        {/* Brand */}
                        <FormField label="Brand" required error={errors.brandId?.message}>
                            <CompReactSelect
                                menuPlacement="auto"
                                optionLabelName="brandName"
                                optionValueName="id"
                                placeHolder="Select brand ..."
                                ref={null}
                                staticOptions={allBrandsCategoriesUnits?.[0]?.jsonResult?.brands ?? []} //meta.current.rows
                                selectedValue={id}
                                onChange={handleOnChangeBrand}
                            />
                        </FormField>

                        {/* product label */}
                        <FormField
                            label="Product Label"
                            required
                            error={errors.label?.message}
                            className="col-span-2">
                            <input
                                type="text"
                                className={inputStyles}
                                placeholder="Enter product name"
                                {...register('label', {
                                    required: Messages.errRequired,
                                    minLength: {
                                        value: 2,
                                        message: Messages.messMin2CharsRequired
                                    }
                                })}
                            />
                        </FormField>

                    </div>

                    <div className="grid grid-cols-4 gap-2">

                        {/* hsn */}
                        <FormField label="HSN" className="flex-1">
                            <NumericFormat
                                allowNegative={false}
                                className={inputStyles}
                                isAllowed={(values) => values.value.length <= 8}
                                placeholder="00000000"
                                thousandSeparator
                                {...register('hsn')}
                            />
                        </FormField>

                        {/* gst rate */}
                        <FormField label="GST Rate (%)">
                            <NumericFormat
                                allowNegative={false}
                                className={clsx(inputStyles, 'w-20')}
                                decimalScale={2}
                                fixedDecimalScale={true}
                                defaultValue={0}
                                // suffix=" %"
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                {...register('gstRate')}
                            />
                        </FormField>

                        {/* upc code */}
                        <FormField label="UPC Code">
                            <NumericFormat
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale={true}
                                className={inputStyles}
                                placeholder="000000000000"
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                {...register('upcCode')}
                            />
                        </FormField>

                        {/* unit */}
                        <FormField label="Unit">
                            <CompReactSelect
                                menuPlacement="auto"
                                optionLabelName="unitName"
                                optionValueName="id"
                                placeHolder="Select unit ..."
                                ref={null}
                                staticOptions={allBrandsCategoriesUnits?.[0]?.jsonResult?.units ?? []} //meta.current.rows
                                selectedValue={id}
                                onChange={handleOnChangeBrand}
                            />
                        </FormField>
                    </div>

                    {/* product description */}
                    <FormField
                        label="Description"
                        className="col-span-2"
                        error={errors.info?.message}>
                        <textarea
                            className={clsx(inputStyles, "resize-none")}
                            placeholder="Describe your product..."
                            rows={4}
                            {...register('info', {
                                maxLength: {
                                    value: 500,
                                    message: Messages.messMax500Chars
                                }
                            })}
                        />
                        <span className="text-xs text-gray-500 mt-1 flex justify-end">
                            <span className={watch("info")?.length || 0 > 400 ? "text-amber-500" : ""}>
                                {watch("info")?.length || 0}
                            </span>/500 characters
                        </span>
                    </FormField>

                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">

                            {/* Max retail price */}
                            <FormField label="Max Retail Price" error={errors.maxRetailPrice?.message}>
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    decimalScale={2}
                                    thousandSeparator
                                    {...register('maxRetailPrice', {
                                        // validate: value => 
                                        //     value >= salePrice || "Must be >= sale price"
                                    })}
                                />
                            </FormField>

                            {/* sale price */}
                            <FormField label="Sale Price">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    decimalScale={2}
                                    thousandSeparator
                                    {...register('salePrice')}
                                />
                            </FormField>

                            {/* sale price gst */}
                            <FormField label="Sale Price (GST)">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    decimalScale={2}
                                    thousandSeparator
                                    {...register('salePriceGst')}
                                />
                            </FormField>
                        </div>

                        {/* dealer price */}
                        <div className="grid grid-cols-3 gap-6">
                            <FormField label="Dealer Price">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    decimalScale={2}
                                    thousandSeparator
                                    {...register('dealerPrice')}
                                />
                            </FormField>

                            {/* purchase price */}
                            <FormField label="Purchase Price">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    decimalScale={2}
                                    thousandSeparator
                                    {...register('purPrice')}
                                />
                            </FormField>

                            {/* purchase price gst */}
                            <FormField label="Purchase Price (GST)">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    decimalScale={2}
                                    thousandSeparator
                                    {...register('purPriceGst')}
                                />
                            </FormField>
                        </div>
                    </div>

                    <WidgetButtonSubmitFullWidth label="Save" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
                </div>
            </form>
        </div>
    );

    function handleOnChangeBrand() {

    }

    function handleOnChangeCategory() {

    }

    async function loadCategory() {
        // try {
        //     const res: any = await Utils.doGenericQuery({
        //         buCode: buCode || '',
        //         dbName: dbName || '',
        //         dbParams: decodedDbParamsObject,
        //         sqlId: SqlIdsMap.getLeafCategories,
        //     })
        //     dispatch(setQueryHelperData({
        //         instance: DataInstancesMap.leafCategories,
        //         data: res
        //     }))
        // } catch (e: any) {
        //     console.log(e)
        // }
    }

    async function onSubmit(data: NewEditProductType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo);
            return;
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: DatabaseTablesMap.ProductM,
                xData: data
            });
            Utils.showSaveMessage();
            dispatch(changeAccSettings());
            dispatch(closeSlidingPane());
            const loadData = context.CompSyncFusionGrid[instance].loadData;
            if (loadData) {
                await loadData();
            }
        } catch (e: any) {
            console.log(e);
        }
    }


}

export type NewEditProductType = {
    id?: number;
    catId?: number;
    brandId?: number;
    unitId?: number;
    label: string;
    productCode: string;
    hsn?: string;
    upcCode?: string;
    gstRate?: number;
    salePrice?: number;
    isActive?: boolean;
    maxRetailPrice?: number;
    dealerPrice?: number;
    salePriceGst?: number;
    purPriceGst?: number;
    purPrice?: number;
    info?: string;
};

// function Section({ title, children }: { title: string; children: React.ReactNode; icon?: string }) {
//     return (
//         <fieldset className="border border-primary-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
//             <legend className="text-lg font-semibold text-primary-500 flex items-center">
//                 {title}
//             </legend>
//             {children}
//         </fieldset>
//     );
// }

// Form Field Component
function FormField({ label, children, required, error, className }: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    className?: string;
}) {
    return (
        <label className={clsx("flex flex-col text-primary-500", className)}>
            <div className="flex items-center gap-1 mb-1.5">
                <span className="font-medium text-sm">{label}</span>
                {required && <WidgetAstrix />}
            </div>
            {children}
            {error && <WidgetFormErrorMessage errorMessage={error} />}
        </label>
    );
}

// const inputStyles = clsx(
//     "w-full rounded-lg border border-gray-200 px-4 py-2 bg-white",
//     "focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none",
//     "placeholder:text-gray-400 text-sm transition-all duration-200",
//     "hover:border-gray-300"
// );
const inputStyles =
    "w-full rounded-lg border border-gray-400 px-4 py-2 bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none placeholder:text-gray-400 text-sm transition-all duration-200 hover:border-gray-300"
