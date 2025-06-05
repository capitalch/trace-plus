import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
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
import { useEffect } from "react";
import { Utils } from "../../../../utils/utils";
import { resetQueryHelperData, setQueryHelperData } from "../../../../app/graphql/query-helper-slice";
import { ProductOpeningBalanceEditType, reSetProductOpeningBalanceEdit, setProductOpeningBalanceEdit } from "../../accounts-slice";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { format, isBefore, parseISO } from "date-fns";

export function ProductsOpeningBalancesWorkBench() {
    const dispatch: AppDispatchType = useDispatch();
    const { branchId, buCode, context, currentDateFormat, currentFinYear, dbName, finYearId, decodedDbParamsObject } = useUtilsInfo();
    const productOpeningBalanceEdit: ProductOpeningBalanceEditType = useSelector((state: RootStateType) => state.accounts.productOpeningBalanceEdit)
    const leafCategoriesWithParent = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.leafCategoriesWithParent]?.data)
    const brandsOnCatId = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.brandsOnCatId]?.data)
    const productLabelsOnCatIdBrandId = useSelector((state: RootStateType) => state.queryHelper[DataInstancesMap.productLabelsOnCatIdBrandId]?.data)

    const {
        clearErrors,
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isSubmitting },
        setValue,
    } = useForm<ProductsOpeningBalancesFormType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id: undefined,
            catId: undefined,
            brandId: undefined,
            labelId: undefined,
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

    useEffect(() => {
        if (productOpeningBalanceEdit.id && productOpeningBalanceEdit.brandId && productOpeningBalanceEdit.catId && productOpeningBalanceEdit.labelId) {
            setValue('id', productOpeningBalanceEdit.id,)
            setValue('catId', productOpeningBalanceEdit.catId,)
            setValue('brandId', productOpeningBalanceEdit.brandId,)
            setValue('labelId', productOpeningBalanceEdit.labelId,)
            setValue('qty', productOpeningBalanceEdit.qty,)
            setValue('openingPrice', productOpeningBalanceEdit.openingPrice,)
            setValue('lastPurchaseDate', productOpeningBalanceEdit.lastPurchaseDate,)
        }
    }, [productOpeningBalanceEdit])

    const id = watch('id')
    const catId = watch('catId')
    const brandId = watch('brandId')
    const labelId = watch('labelId')
    const qty = watch('qty')
    const openingPrice = watch('openingPrice')

    useEffect(() => {
        if (_.isEmpty(productLabelsOnCatIdBrandId)) {
            return
        }
        setValue('labelId', productOpeningBalanceEdit.labelId,)
    }, [productLabelsOnCatIdBrandId])

    useEffect(() => {
        return (() => {
            resetEditData()
            resetBrandsOptions()
            resetLabelsOptions()
            resetOtherControls()
        })
    }, [])

    useEffect(() => {
        if (!catId) {
            return
        }
        fetchBrands()
    }, [catId])

    useEffect(() => {
        if (!brandId) {
            return
        }
        fetchLabels()
    }, [catId, brandId])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<div className="flex flex-col border-2 border-amber-400 rounded-lg w-full max-w-lg bg-white shadow-md p-4 h-full">
        <div className="flex justify-between items-center align-middle">
            <label className="text-lg mb-1 font-medium text-primary-500">Opening Balance</label>
            <label className="text-sm text-primary-400 font-bold">{id ? 'Edit' : 'New'}</label>
        </div>
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
                    selectedValue={catId}
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
                    selectedValue={brandId}
                    onChange={handleOnChangeBrand}
                />
            </FormField>

            {/* product label */}
            <FormField
                label="Product Label" required error={errors.labelId?.message}>
                <CompReactSelect
                    menuPlacement="auto"
                    optionLabelName="label"
                    optionValueName="id"
                    placeHolder="Select product label ..."
                    {...register('labelId'
                        , { required: Messages.errRequired })}
                    ref={null}
                    staticOptions={productLabelsOnCatIdBrandId}
                    selectedValue={labelId}
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
                        value={qty}
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
                        value={openingPrice}
                    />
                </FormField>
            </div>

            {/* Last purchaseDate */}
            <FormField label="Last purchase date" required error={errors.lastPurchaseDate?.message}>
                <input
                    type='date'
                    className={clsx('text-right rounded-md')}
                    {...register('lastPurchaseDate', {
                        required: Messages.errRequired,
                        validate: (value: any) => {
                            const selectedDate = parseISO(value);
                            const startDate = parseISO(currentFinYear?.startDate || '')
                            const formattedStartDate = format(startDate, currentDateFormat)
                            return (isBefore(selectedDate, startDate) || `${Messages.errLastPurDateLessThanStartDate} ${formattedStartDate}`)
                        }
                    })}
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
        setValue('labelId', selectedLabel?.id, { shouldDirty: true })
        clearErrors('labelId')
    }

    function handleResetAll() {
        dispatch(reSetProductOpeningBalanceEdit())
        setValue('catId', undefined,)
        setValue('brandId', undefined)
        setValue('labelId', undefined)
        setValue('id', undefined)
        setValue('qty', 0)
        setValue('openingPrice', 0)
        setValue('lastPurchaseDate', undefined)
        resetOtherControls()
        resetBrandsOptions()
        resetLabelsOptions()
    }

    async function onSubmit(data: ProductsOpeningBalancesFormType) {
        const isSame = _.isEqual(data, productOpeningBalanceEdit)
        if (isSame) {
            Utils.showAlertMessage('Oops!', Messages.messNothingToDo)
            return
        }
        try {
            const xData = {
                id: data.id,
                branchId: branchId,
                finYearId: finYearId,
                productId: data.labelId,
                qty: data.qty,
                openingPrice: data.openingPrice,
                lastPurchaseDate: data.lastPurchaseDate
            }
            if(id){
                await Utils.doGenericUpdate({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.ProductOpBal,
                    xData: xData
                });
            } else {
                await Utils.doGenericUpdateQuery({
                    buCode: buCode || '',
                    dbName: dbName || '',
                    dbParams: decodedDbParamsObject,
                    sqlId:SqlIdsMap.upsertProductOpeningBalance,
                    sqlArgs:{
                        ...xData,
                        id: undefined
                    }
                })
            }
            
            Utils.showSaveMessage();
            handleResetAll()
            const loadData = context.CompSyncFusionGrid[DataInstancesMap.productsOpeningBalances].loadData;
            if (loadData) await loadData();
        } catch (e: any) {
            console.log(e)
        }
    }

    function resetBrandsOptions() {
        dispatch(resetQueryHelperData({
            instance: DataInstancesMap.brandsOnCatId
        }))
    }

    function resetEditData() {
        dispatch(setProductOpeningBalanceEdit({
            id: undefined,
            catId: undefined,
            brandId: undefined,
            labelId: undefined
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

type ProductsOpeningBalancesFormType = {
    id?: number
    catId?: number
    brandId?: number
    labelId?: number
    qty?: number
    openingPrice?: number
    lastPurchaseDate?: string
}