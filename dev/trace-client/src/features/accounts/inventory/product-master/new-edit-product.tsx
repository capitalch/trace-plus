import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useValidators } from "../../../../utils/validators-hook";
import { useForm } from "react-hook-form";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { useEffect } from "react";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { resetQueryHelperData, setQueryHelperData } from "../../../../app/graphql/query-helper-slice";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki";
import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { FormField } from "../../../../controls/widgets/form-field";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";

export function NewEditProduct({ props }: any) {
    const { id } = props
    const dispatch: AppDispatchType = useDispatch();
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();
    const allBrandsCategoriesUnits = useSelector((state: RootStateType) =>
        state.queryHelper[DataInstancesMap.brandsCategoriesUnits]?.data)
    const productOnId: NewEditProductType = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.productOnId]?.data)

    const {
        checkAllowSomeSpecialChars,
        checkAllowSomeSpecialChars1,
    } = useValidators();

    const {
        clearErrors,
        getValues,
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isSubmitting },
        setError,
        setValue,
    } = useForm<NewEditProductType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id: id,
            catId: undefined,
            brandId: undefined,
            unitId: undefined,
            label: undefined,
            hsn: null,
            upcCode: null,
            gstRate: 0,
            salePrice: 0,
            isActive: true,
            maxRetailPrice: 0,
            dealerPrice: 0,
            salePriceGst: 0,
            purPriceGst: 0,
            purPrice: 0,
            info: null
        },
    });

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-PRODUCT-LABEL'], 1200).subscribe(async () => {
            validateCatIdBrandIdLabel()
        })
        const subs2 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-PRODUCT-UPC-CODE'], 1200).subscribe(async (d: any) => {
            setValue('upcCode', d.data?.upcCode)
            validateUpcCode()
        })
        return (() => {
            subs1.unsubscribe()
            subs2.unsubscribe()
            dispatch(resetQueryHelperData({ instance: DataInstancesMap.productOnId }))
        })
    }, [])

    useEffect(() => {
        if (!_.isEmpty(allBrandsCategoriesUnits)) {
            if (id) {
                loadProduct()
            }
        }
    }, [allBrandsCategoriesUnits])

    useEffect(() => {
        if (!_.isEmpty(productOnId)) {
            Object.entries(productOnId).forEach(([key, value]) => setValue(key as any, value));
        }
    }, [productOnId])

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
                                {...register('catId'
                                    , { required: Messages.errRequired })}
                                onChange={handleOnChangeCategory}
                                ref={null}
                                staticOptions={allBrandsCategoriesUnits?.[0]?.jsonResult?.categories ?? []} //meta.current.rows
                                selectedValue={watch('catId')}
                            />
                        </FormField>

                        {/* Brand */}
                        <FormField label="Brand" required error={errors.brandId?.message}>
                            <CompReactSelect
                                menuPlacement="auto"
                                optionLabelName="brandName"
                                optionValueName="id"
                                placeHolder="Select brand ..."
                                {...register('brandId'
                                    , { required: Messages.errRequired })}
                                ref={null}
                                staticOptions={allBrandsCategoriesUnits?.[0]?.jsonResult?.brands ?? []} //meta.current.rows
                                selectedValue={watch('brandId')}
                                onChange={handleOnChangeBrand}
                            />
                        </FormField>

                        {/* product label */}
                        <FormField
                            label="Product Label"
                            required
                            error={errors.label?.message}
                            className="">
                            <input
                                type="text"
                                className={inputFormFieldStyles}
                                placeholder="Enter product name"
                                {...register('label', {
                                    required: Messages.errRequired,
                                    minLength: {
                                        value: 2,
                                        message: Messages.messMin2CharsRequired
                                    },
                                    validate: checkAllowSomeSpecialChars1,
                                    onChange: (e: any) => {
                                        ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-PRODUCT-LABEL'], { label: e.target.value })
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
                                className={inputFormFieldStyles}
                                isAllowed={(values) => values.value.length <= 8}
                                onValueChange={(values) => setValue('hsn', values.floatValue || null)}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                {...register('hsn', {
                                    validate: (value) => ((value ?? 0) < (10000000)) || Messages.errHsnTooHigh
                                })}
                                placeholder="00000000"
                                value={watch('hsn')}
                            />
                        </FormField>

                        {/* gst rate */}
                        <FormField label="GST Rate (%)" error={errors.gstRate?.message}>
                            <NumericFormat
                                allowNegative={false}
                                className={clsx(inputFormFieldStyles, 'text-right')}
                                decimalScale={2}
                                fixedDecimalScale={true}
                                {...register('gstRate', {
                                    validate: (value) => ((value ?? 0) < (41)) || Messages.errGstRateTooHigh
                                })}
                                defaultValue={0}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                onValueChange={(values) => setValue('gstRate', values.floatValue, { shouldValidate: true, shouldDirty: true })}
                                value={watch('gstRate')}
                            />
                        </FormField>

                        {/* upc code */}
                        <FormField label="UPC Code">
                            <NumericFormat
                                allowNegative={false}
                                decimalScale={2}
                                className={inputFormFieldStyles}
                                placeholder="000000000000"
                                {...register('upcCode')}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                onValueChange={(values) =>
                                    // setValue('upcCode', values.floatValue || null)
                                    ibukiDdebounceEmit(IbukiMessages["DEBOUNCE-PRODUCT-UPC-CODE"], { upcCode: values.floatValue || null })
                                }
                                value={watch('upcCode')}
                            />
                        </FormField>

                        {/* unit */}
                        <FormField label="Unit" required error={errors.unitId?.message}>
                            <CompReactSelect
                                className="-mt-1"
                                menuPlacement="auto"
                                optionLabelName="unitName"
                                optionValueName="id"
                                placeHolder="Select unit ..."
                                {...register('unitId'
                                    , { required: Messages.errRequired })}
                                ref={null}
                                staticOptions={allBrandsCategoriesUnits?.[0]?.jsonResult?.units ?? []} //meta.current.rows
                                selectedValue={watch('unitId') || 1}
                                onChange={handleOnChangeUnit}
                            />
                        </FormField>
                    </div>

                    {/* product description */}
                    <FormField
                        label="Description"
                        className="col-span-2"
                        error={errors.info?.message}>
                        <textarea
                            className={clsx(inputFormFieldStyles, "resize-none")}
                            placeholder="Describe your product..."
                            rows={4}
                            {...register('info', {
                                maxLength: {
                                    value: 500,
                                    message: Messages.messMax500Chars
                                },
                                validate: checkAllowSomeSpecialChars
                            })}
                        // value={watch('info') || null}
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
                                    className={clsx(inputFormFieldStyles, 'text-right')}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    thousandSeparator
                                    {...register('maxRetailPrice', {
                                        validate: value =>
                                            ((value ?? 0) >= (watch('salePriceGst') ?? 0)) || Messages.messMustBeGESalePriceGst
                                    })}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) => setValue('maxRetailPrice', values.floatValue)}
                                    value={watch('maxRetailPrice')}
                                />
                            </FormField>

                            {/* sale price */}
                            <FormField label="Sale Price">
                                <NumericFormat
                                    allowNegative={false}
                                    className={clsx(inputFormFieldStyles, 'text-right')}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    thousandSeparator
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) => setValue('salePrice', values.floatValue)}
                                    value={watch('salePrice')}
                                />
                            </FormField>

                            {/* sale price gst */}
                            <FormField label="Sale Price (GST)">
                                <NumericFormat
                                    allowNegative={false}
                                    className={clsx(inputFormFieldStyles, 'text-right')}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    thousandSeparator
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) => setValue('salePriceGst', values.floatValue)}
                                    value={watch('salePriceGst')}
                                />
                            </FormField>
                        </div>

                        {/* dealer price */}
                        <div className="grid grid-cols-3 gap-6">
                            <FormField label="Dealer Price">
                                <NumericFormat
                                    allowNegative={false}
                                    className={clsx(inputFormFieldStyles, 'text-right')}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    thousandSeparator
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) => setValue('dealerPrice', values.floatValue)}
                                    value={watch('dealerPrice')}
                                />
                            </FormField>

                            {/* purchase price */}
                            <FormField label="Purchase Price">
                                <NumericFormat
                                    allowNegative={false}
                                    className={clsx(inputFormFieldStyles, 'text-right')}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    thousandSeparator
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) => setValue('purPrice', values.floatValue)}
                                    value={watch('purPrice')}
                                />
                            </FormField>

                            {/* purchase price gst */}
                            <FormField label="Purchase Price (GST)">
                                <NumericFormat
                                    allowNegative={false}
                                    className={clsx(inputFormFieldStyles, 'text-right')}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    thousandSeparator
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) => setValue('purPriceGst', values.floatValue)}
                                    value={watch('purPriceGst')}
                                />
                            </FormField>
                        </div>
                    </div>
                    {showServerValidationError()}
                    <WidgetButtonSubmitFullWidth label="Save" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
                </div>

            </form>

        </div>
    )

    function handleOnChangeBrand(selectedBrand: any) {
        setValue('brandId', selectedBrand?.id, { shouldDirty: true })
        clearErrors('brandId')
        validateCatIdBrandIdLabel()
    }

    function handleOnChangeCategory(selectedCat: any) {
        setValue('catId', selectedCat?.id, { shouldDirty: true })
        clearErrors('catId')
        validateCatIdBrandIdLabel()
    }

    function handleOnChangeUnit(selectedUnit: any) {
        setValue('unitId', selectedUnit?.id, { shouldDirty: true })
        clearErrors('unitId')
    }

    async function loadProduct() {
        try {
            const res: any = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                sqlId: SqlIdsMap.getProductOnId,
                sqlArgs: { id: id }
            })
            dispatch(setQueryHelperData({
                instance: DataInstancesMap.productOnId,
                data: res?.[0] || []
            }))
        } catch (e: any) {
            console.log(e)
        }
    }

    async function onSubmit(data: NewEditProductType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo);
            return;
        }
        try {
            if (id) {
                //update
                await Utils.doGenericUpdate({
                    buCode: buCode || '',
                    tableName: AllTables.ProductM.name,
                    xData: data
                });
            } else {
                // insert
                await Utils.doGenericUpdateQuery({
                    buCode: buCode || '',
                    dbName: dbName || '',
                    dbParams: decodedDbParamsObject,
                    sqlId: SqlIdsMap.insertProduct,
                    sqlArgs: data
                })
            }

            Utils.showSaveMessage();
            dispatch(closeSlidingPane());
            const loadData = context.CompSyncFusionGrid[DataInstancesMap.productMaster].loadData;
            if (loadData) {
                await loadData();
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    function showServerValidationError() {
        let Ret = <></>
        if (errors?.root?.catIdBrandIdLabel) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.catIdBrandIdLabel.message} />
        }
        else if (errors?.root?.upcCode) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.upcCode.message} />
        }
        else {
            Ret = <WidgetFormHelperText helperText='&nbsp;' />
        }
        return (Ret)
    }

    async function validateCatIdBrandIdLabel() {
        const values = getValues()
        if ((!values.catId) || (!values.brandId) || (!values.label)) {
            return
        }
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: id ? SqlIdsMap.doesOtherCatIdBrandIdProductLabelExist : SqlIdsMap.doesCatIdBrandIdProductLabelExist,
            sqlArgs: {
                catId: values.catId,
                brandId: values.brandId,
                label: values.label,
                id: id
            }
        })
        if (res?.[0]?.exists) {
            setError('root.catIdBrandIdLabel', {
                type: 'serverError',
                message: Messages.errCatBrandLabelExists
            })
        } else {
            clearErrors('root.catIdBrandIdLabel')
        }
    }

    async function validateUpcCode() {
        const values = getValues()
        const upcCode = values.upcCode
        if (!upcCode) {
            return
        }
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.doesUpcCodeExist,
            sqlArgs: {
                upcCode: upcCode
            }
        })
        if (res?.[0]?.exists) {
            setError('root.upcCode', {
                type: 'serverError',
                message: Messages.errUpcCodeExists
            })
        } else {
            clearErrors('root.upcCode')
        }
    }
}



export type NewEditProductType = {
    id?: number;
    catId?: number;
    brandId?: number;
    unitId?: number;
    label: string;
    hsn: number | null;
    upcCode: number | null;
    gstRate?: number;
    salePrice?: number;
    isActive?: boolean;
    maxRetailPrice?: number;
    dealerPrice?: number;
    salePriceGst?: number;
    purPriceGst?: number;
    purPrice?: number;
    info?: string | null;
};

// const inputStyles = clsx(
//     "w-full rounded-lg border border-gray-800 px-4 py-2 bg-white",
//     "focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none",
//     "placeholder:text-gray-400 text-sm transition-all duration-200",
//     "hover:border-gray-300"
// );
