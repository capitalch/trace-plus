import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store/store";
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
import { useEffect, useRef } from "react";
import { ProductCatIdBrandIdLabelType } from "../../accounts-slice";

export function ProductsOpeningBalancesWorkBench() {
    // const dispatch: AppDispatchType = useDispatch();
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const productCatIdBrandIdLabel: ProductCatIdBrandIdLabelType = useSelector((state: RootStateType) => state.accounts.productCatIdBrandIdLabel)
    const leafCategoriesWithParent = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.leafCategoriesWithParent]?.data)
    const brandsOnCatId = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.brandsOnCatId]?.data)
    const productLabelsOnCatIdBrandId = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.productLabelsOnCatIdBrandId]?.data)
    // const meta = useRef<MetaType>({})
    const formRef: any = useRef(null)
    const {
        clearErrors,
        getValues,
        register,
        handleSubmit,
        // trigger,
        watch,
        formState: { errors, isSubmitting },
        // setError,
        setValue,
    } = useForm<ProductsOpeningBalancesFormType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            // id: id,
            catId: productCatIdBrandIdLabel.catId,
            brandId: productCatIdBrandIdLabel.brandId,
            unitId: undefined,
            label: productCatIdBrandIdLabel.label,
            qty: 0,
            openingPrice: 0,
            lastPurchaseDate: undefined
            // hsn: undefined,
            // upcCode: undefined,
            // gstRate: 0,
            // salePrice: 0,
            // isActive: true,
            // maxRetailPrice: 0,
            // dealerPrice: 0,
            // salePriceGst: 0,
            // purPriceGst: 0,
            // purPrice: 0,
            // info: undefined
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

    useEffect(()=>{

    },[])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<div className="border-4 border-amber-400 rounded-lg w-full max-w-lg bg-white shadow-md p-4 h-[calc(100vh-120px)]">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

            {/* category */}
            <FormField label="Category" required>
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
            <FormField label="Brand" required >
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
                label="Product Label" required>
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
                <FormField label="Qty" >
                    <NumericFormat
                        allowNegative={false}
                        className={clsx('text-right')}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        {...register('qty', {
                            // validate: (value) => ((value ?? 0) < (41)) || Messages.errGstRateTooHigh
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
                        className={clsx('text-right')}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        {...register('openingPrice', {
                            // validate: (value) => ((value ?? 0) < (41)) || Messages.errGstRateTooHigh
                        })}
                        defaultValue={0}
                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                        onValueChange={(values) => setValue('openingPrice', values.floatValue, { shouldValidate: true, shouldDirty: true })}
                        value={watch('openingPrice')}
                    />
                </FormField>
            </div>

            {/* Last purchaseDate */}
            <FormField label="Last purchase date" >
                <input
                    type='date'
                    className={clsx('text-right')}
                    {...register('lastPurchaseDate', {
                        // validate: (value) => ((value ?? 0) < (41)) || Messages.errGstRateTooHigh
                    })}
                    value={watch('openingPrice')}
                />
            </FormField>

            <WidgetButtonSubmitFullWidth className="mt-4" label="Submit" disabled={(isSubmitting) || (!_.isEmpty(errors))} />

        </form>
        <div className="w-full flex justify-end mt-10">
            <button className="w-36 bg-amber-600 text-gray-100 rounded-md py-1 text-lg hover:bg-amber-800 hover:text-white">Reset</button>
        </div>
    </div>)

    async function handleOnChangeBrand(selectedBrand: any) {
        const catId = undefined
        // if (meta.current) {
        //     catId = meta.current.catId
        // }
        if ((!selectedBrand?.id) || (!catId)) {
            return
        }
        // meta.current.brandId = selectedBrand.id
        clearErrors('brandId')
        try {
            // const res = await Utils.doGenericQuery({
            //     buCode: buCode || '',
            //     dbName: dbName || '',
            //     dbParams: decodedDbParamsObject,
            //     sqlId: SqlIdsMap.getProductLabelsOnCatIdBrandId,
            //     sqlArgs: { catId: meta.current.catId, brandId: meta.current.brandId }
            // })
            // dispatch(setQueryHelperData({
            //     data: res,
            //     instance: DataInstancesMap.productLabelsOnCatIdBrandId
            // }))
        } catch (e: any) {
            console.log(e)
        }
    }

    async function handleOnChangeCategory(selectedCat: any) {
        if (!selectedCat?.id) {
            return
        }
        // if (meta.current) {
        //     meta.current.catId = selectedCat.id
        // }
        clearErrors('catId')
        setValue('catId', selectedCat.id)
        try {
            // const res = await Utils.doGenericQuery({
            //     buCode: buCode || '',
            //     dbName: dbName || '',
            //     dbParams: decodedDbParamsObject,
            //     sqlId: SqlIdsMap.getBrandsOnCatId,
            //     sqlArgs: { catId: meta.current.catId }
            // })
            // dispatch(setQueryHelperData({
            //     data: res,
            //     instance: DataInstancesMap.brandsOnCatId
            // }))
        } catch (e: any) {
            console.log(e)
        }
    }

    function handleOnChangeLabel(selectedLabel: any) {
        setValue('label', selectedLabel?.id, { shouldDirty: true })
        clearErrors('label')
    }

    async function onSubmit(data: any) {
        console.log(data)
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
    catId?: number
    brandId?: number
    unitId: number
    label?: string
    qty?: number
    openingPrice?: number
    lastPurchaseDate?: string
}