import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
// import { useValidators } from "../../../../utils/validators-hook";
import { useForm } from "react-hook-form";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import clsx from "clsx";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { Messages } from "../../../../utils/messages";
import { NumericFormat } from "react-number-format";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
// import { Utils } from "../../../../utils/utils";
// import { setQueryHelperData } from "../../../../app/graphql/query-helper-slice";
import { useEffect, } from "react";
import { Utils } from "../../../../utils/utils";
import { resetQueryHelperData, setQueryHelperData } from "../../../../app/graphql/query-helper-slice";
// import { ProductCatIdBrandIdLabelType } from "../../accounts-slice";

export function ProductsOpeningBalancesWorkBench() {
    const dispatch: AppDispatchType = useDispatch();
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    // const productCatIdBrandIdLabel: ProductCatIdBrandIdLabelType = useSelector((state: RootStateType) => state.accounts.productCatIdBrandIdLabel)
    const leafCategoriesWithParent = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.leafCategoriesWithParent]?.data)
    const brandsOnCatId = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.brandsOnCatId]?.data)
    const productLabelsOnCatIdBrandId = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.productLabelsOnCatIdBrandId]?.data)

    const {
        clearErrors,
        // getValues,
        register,
        handleSubmit,
        // trigger,
        watch,
        formState: { errors, isDirty, isSubmitting },
        // setError,
        setValue,
    } = useForm<ProductsOpeningBalancesFormType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            // id: id,
            catId: undefined, // productCatIdBrandIdLabel.catId,
            brandId: undefined, //productCatIdBrandIdLabel.brandId,
            label: undefined, //productCatIdBrandIdLabel.label,
            qty: 0,
            openingPrice: 0,
            lastPurchaseDate: undefined
        },
    });

    const { loading } = useQueryHelper({
        instance: DataInstancesMap.leafCategoriesWithParent,
        dbName: dbName,
        isExecQueryOnLoad: true,
        getQueryArgs: () => ({
            buCode: buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getLeafCategoriesWithParent
        })
    })

    const catId = watch('catId')
    const brandId = watch('brandId')

    useEffect(() => {
        return (() => {
            resetBrandsOptions()
            resetLabelsOptions()
        })
    }, [])

    useEffect(() => {
        if (!catId) {
            return
        }
        fetchBrands()
        setValue('brandId', undefined)
        setValue('label', undefined)
        resetLabelsOptions()
        resetOtherControls()
    }, [catId])

    useEffect(() => {
        if (!brandId) {
            return
        }
        fetchLabels()
        setValue('label', undefined)
        // resetOtherControls()
    }, [brandId])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<div className="border-2 border-amber-400 rounded-lg w-full max-w-lg bg-white shadow-md p-4 h-[calc(100vh-120px)]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

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
                    staticOptions={leafCategoriesWithParent} //meta.current.rows
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
                    staticOptions={brandsOnCatId} //meta.current.rows
                    selectedValue={watch('brandId')}
                    onChange={handleOnChangeBrand}
                />
            </FormField>

            {/* product label */}
            <FormField
                label="Product Label" required error={errors.label?.message}>
                <CompReactSelect
                    menuPlacement="auto"
                    optionLabelName="label"
                    optionValueName="id"
                    placeHolder="Select product label ..."
                    {...register('label'
                        , { required: Messages.errRequired })}
                    ref={null}
                    staticOptions={productLabelsOnCatIdBrandId}
                    selectedValue={watch('label')}
                    onChange={handleOnChangeLabel}
                />
            </FormField>

            <div className="grid grid-cols-2 gap-2">

                {/* qty */}
                <FormField label="Qty" required error={errors.qty?.message}>
                    <NumericFormat
                        allowNegative={false}
                        className={clsx('text-right rounded-md')}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        {...register('qty', {
                            required: Messages.errRequired,
                            validate: (value) => ((value ?? 0) > 0 ? true : Messages.errCannotBeZero)
                        })}
                        defaultValue={0}
                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                        onValueChange={(values) => setValue('qty', values.floatValue, { shouldValidate: true, shouldDirty: true })}
                        value={watch('qty')}
                    />
                </FormField>

                {/* opening price */}
                <FormField label="Opening price" >
                    <NumericFormat
                        allowNegative={false}
                        className={clsx('text-right mt-1 rounded-md')}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        {...register('openingPrice')}
                        defaultValue={0}
                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                        onValueChange={(values) => setValue('openingPrice', values.floatValue, { shouldValidate: true, shouldDirty: true })}
                        value={watch('openingPrice')}
                    />
                </FormField>
            </div>

            {/* Last purchaseDate */}
            <FormField label="Last purchase date" required error={errors.lastPurchaseDate?.message}>
                <input
                    type='date'
                    className={clsx('text-right rounded-md')}
                    {...register('lastPurchaseDate', {
                        required: Messages.errRequired
                    })}
                    value={watch('lastPurchaseDate')}
                />
            </FormField>

            <WidgetButtonSubmitFullWidth className="mt-2" label="Submit" disabled={(isSubmitting) || (!_.isEmpty(errors)) || !(isDirty)} />

        </form>
        <div className="w-full flex justify-end mt-2">
            <button onClick={handleResetAll} className="w-36 bg-amber-600 text-gray-100 rounded-md py-1 text-lg hover:bg-amber-800 hover:text-white">Reset</button>
        </div>
    </div>)

    async function fetchBrands() {
        try {
            const res = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                sqlId: SqlIdsMap.getBrandsOnCatId,
                sqlArgs: { catId: catId }
            })
            dispatch(setQueryHelperData({
                data: res,
                instance: DataInstancesMap.brandsOnCatId
            }))
        } catch (e: any) {
            console.log(e)
        }
    }

    async function fetchLabels() {
        try {
            const res = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                sqlId: SqlIdsMap.getProductLabelsOnCatIdBrandId,
                sqlArgs: { catId: catId, brandId: brandId }
            })
            dispatch(setQueryHelperData({
                data: res,
                instance: DataInstancesMap.productLabelsOnCatIdBrandId
            }))
        } catch (e: any) {
            console.log(e)
        }
    }

    async function handleOnChangeBrand(selectedBrand: any) {
        if ((!selectedBrand?.id) || (!catId)) {
            return
        }
        setValue('brandId', selectedBrand.id, { shouldDirty: true })
        clearErrors('brandId')
    }

    async function handleOnChangeCategory(selectedCat: any) {
        if (!selectedCat?.id) {
            return
        }
        clearErrors('catId')
        setValue('catId', selectedCat.id, { shouldDirty: true })
    }

    function handleOnChangeLabel(selectedLabel: any) {
        setValue('label', selectedLabel?.id, { shouldDirty: true })
        clearErrors('label')
    }

    function handleResetAll() {
        setValue('catId', undefined,)
        setValue('brandId', undefined)
        setValue('label', undefined)
        setValue('id', undefined)
        resetOtherControls()
        resetBrandsOptions()
        resetLabelsOptions()
    }


    async function onSubmit(data: any) {
        console.log(data)
    }

    function resetBrandsOptions() {
        dispatch(resetQueryHelperData({
            instance: DataInstancesMap.brandsOnCatId
        }))
    }

    function resetLabelsOptions() {
        dispatch(resetQueryHelperData({
            instance: DataInstancesMap.productLabelsOnCatIdBrandId
        }))
    }

    function resetOtherControls() {
        setValue('qty', 0)
        setValue('openingPrice', 0)
        setValue('lastPurchaseDate', undefined)
    }
}

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

// type MetaType = {
//     brandId?: number
//     catId?: number
//     label?: string
// }
type ProductsOpeningBalancesFormType = {
    id?: number
    catId?: number
    brandId?: number
    label?: string
    qty?: number
    openingPrice?: number
    lastPurchaseDate?: string
}