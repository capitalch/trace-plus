import { useFieldArray, useForm } from "react-hook-form";
import { Messages } from "../../../../../utils/messages";
import { useValidators } from "../../../../../utils/validators-hook";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { IconSubmit } from "../../../../../controls/icons/icon-submit";
import { IconReset } from "../../../../../controls/icons/icon-reset";
import { FormField } from "../../../../../controls/widgets/form-field";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { CompReactSelect } from "../../../../../controls/components/comp-react-select";
import { useSelector } from "react-redux";
import { allBranchesSelectorFn, BranchType } from "../../../../login/login-slice";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconDelete } from "../../../../../controls/icons/icon-delete";
import clsx from "clsx";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { NumericFormat } from "react-number-format";
import { useState } from "react";
import { Utils } from "../../../../../utils/utils";
import Decimal from "decimal.js";
import { ProductInfoType, ProductSelectFromGrid } from "../../../../../controls/components/product-select-from-grid";

export function ProductsBranchTransferMain({ id }: { id?: string | number }) {
    console.log(id)
    // const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
    const handleTooltipToggle = (idx: number) => {
        setTooltipIndex(tooltipIndex === idx ? null : idx);
    };

    const { branchId } = useUtilsInfo()
    const { checkAllowedDate } = useValidators()
    const {
        control
        // , clearErrors
        , formState: { errors }
        , handleSubmit
        , register
        , setValue
        , watch,
    } = useForm<BranchTransferType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            tranDate: "",
            userRefNo: "",
            remarks: "",
            destBranchId: undefined,
            productLineItems: [{ productCode: "", productDetails: "", lineRefNo: "", qty: 1, price: 0, lineRemarks: "", serialNo: "" }]
        }
    });

    const { fields, append, remove, } = useFieldArray({
        control,
        name: "productLineItems",
    });

    const allBranches: BranchType[] = useSelector(allBranchesSelectorFn) || []
    const availableDestBranches = allBranches.filter((branch: BranchType) => branch.branchId !== branchId)

    const formFields = {
        autoRefNo: watch('autoRefNo')
    }

    return (<div className="h-[calc(100vh-240px)]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mr-6 min-w-[85rem]">

            {/* Header */}
            <div className="flex items-center align-middle gap-2 flex-wrap">

                {/* Auto ref no */}
                <FormField label="Auto ref no" className="w-40 ">
                    <label className="border-b-2 mt-10 border-gray-200">{formFields.autoRefNo}</label>
                </FormField>

                {/* tran date */}
                <FormField label="Date" required error={errors.tranDate?.message}>
                    <input
                        type='date'
                        className='text-right rounded-lg h-10'
                        {...register('tranDate', {
                            required: Messages.errRequired,
                            validate: checkAllowedDate
                        })} />
                </FormField>

                {/* User ref no */}
                <FormField
                    label="Use ref no">
                    <input
                        type="text"
                        className={clsx(inputFormFieldStyles, 'mt-1')}
                        placeholder="Enter user ref no"
                        {...register('userRefNo')}
                    />
                </FormField>

                {/* Remarks */}
                <FormField className="min-w-60 w-auto"
                    label="Remarks">
                    <textarea
                        rows={3}
                        className={clsx(inputFormFieldStyles, 'text-xs')}
                        placeholder="Enter remarks"
                        {...register('remarks')}
                    />
                </FormField>

                {/* Dest branch */}
                <FormField label="Destination branch" required error={errors.destBranchId?.message}>
                    <CompReactSelect
                        menuPlacement="auto"
                        optionLabelName="branchName"
                        optionValueName="branchId"
                        placeHolder="Select dest branch ..."
                        {...register('destBranchId'
                            , { required: Messages.errRequired })}
                        onChange={handleOnChangeDestBranch}
                        ref={null}
                        staticOptions={availableDestBranches || []}
                        selectedValue={watch('destBranchId')}
                    />
                </FormField>

                {/* Reset submit */}
                <div className="flex gap-3 ml-auto mt-8">
                    {/* Reset */}
                    <button onClick={handleReset} type="button" className="px-5 py-2 font-medium text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-200">
                        <IconReset className="text-white w-6 h-6 mr-2" />Reset</button>
                    {/* Submit */}
                    <button disabled={false} className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200">
                        <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit</button>
                </div>
            </div>

            {/* Product line items */}
            <div className="">
                <label className="font-medium">Products</label>
                <table className="w-full border-collapse mt-2">
                    <thead>
                        <tr className="bg-gray-100 text-primary-500">
                            <th className="p-2 border w-10">#</th>
                            <th className="p-2 border w-32">Product Code</th>
                            <th className="p-2 border w-xs">Product Details</th>
                            <th className="p-2 border">Ref No</th>
                            <th className="p-2 border w-28 text-right">Qty</th>
                            <th className="p-2 border w-40 text-right">Price</th>
                            <th className="p-2 border w-44 text-right">Amount</th>
                            <th className="p-2 border">Line Remarks</th>
                            <th className="p-2 border">Serial No</th>
                            <th className="p-2 border"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((item, index) => {
                            const qty = watch(`productLineItems.${index}.qty`);
                            const price = watch(`productLineItems.${index}.price`);
                            const amount = qty * price;

                            return (
                                <tr key={item.id} className="border">
                                    {/* index */}
                                    <td className="p-2 border">{index + 1}</td>
                                    {/* product code */}
                                    <td className="p-2 border">
                                        <div className="flex items-center align-middle justify-center">
                                            <input
                                                type="text"
                                                {...register(`productLineItems.${index}.productCode`)}
                                                onBlur={() => handleOnBlurProductCode(index)}
                                                className="border p-2 rounded w-full"
                                            />
                                            <div className="flex flex-col gap-2">
                                                <button type="button" onClick={() => handleProductSearch(index)} className="ml-2 text-blue-500">
                                                    <IconSearch />
                                                </button>
                                                <button type="button" onClick={() => handleProductClear(index)} className="ml-2 text-blue-500">
                                                    <IconClear />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    {/* product details */}
                                    <td className="p-2 border">
                                        <textarea
                                            rows={3}
                                            {...register(`productLineItems.${index}.productDetails`)}
                                            className="border px-2 py-0.5 rounded w-full bg-gray-100 text-xs"
                                            readOnly
                                        />
                                    </td>
                                    {/* ref no */}
                                    <td className="p-2 border">
                                        <input
                                            type="text"
                                            {...register(`productLineItems.${index}.lineRefNo`)}
                                            className="border p-2 rounded w-full" />
                                    </td>
                                    {/* qty */}
                                    <td className="p-2 border  relative">
                                        <NumericFormat
                                            allowNegative={false}
                                            decimalScale={2}
                                            defaultValue={0}
                                            fixedDecimalScale={true}
                                            {...register(`productLineItems.${index}.qty`, {
                                                validate: (value) => value > 0 || "Qty cannot be zero",
                                            })}
                                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                            onValueChange={(values) => setValue(`productLineItems.${index}.qty`, values.floatValue || 0, { shouldValidate: true, shouldDirty: true })}
                                            thousandSeparator={true}
                                            value={watch(`productLineItems.${index}.qty`)}
                                            className={clsx(
                                                "border p-2 rounded w-full text-right",
                                                watch(`productLineItems.${index}.qty`) === 0 ? "border-red-500 bg-red-100" : ""
                                            )}
                                        />
                                        {/* Error Indicator & Tooltip Button */}
                                        {watch(`productLineItems.${index}.qty`) === 0 && (
                                            <div className="absolute top-0 right-0">
                                                <button
                                                    type="button"
                                                    className="relative"
                                                    onClick={() => handleTooltipToggle(index)}
                                                    onBlur={() => setTooltipIndex(null)}>
                                                    {/* Small red triangle indicator */}
                                                    <div className="w-0 h-0 
                                                        border-t-11 border-t-red-500 
                                                        border-l-11 border-l-transparent 
                                                        border-b-0 border-r-0"
                                                    />
                                                </button>

                                                {/* Error Tooltip (Only shows for the clicked index) */}
                                                {tooltipIndex === index && (
                                                    <div className="absolute right-0 top-2 bg-red-500 text-white text-xs p-2 rounded shadow-lg w-max z-10">
                                                        {errors?.productLineItems?.[index]?.qty?.message || Messages.errQtyCannotBeZero}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    {/* price */}
                                    <td className="p-2 border">
                                        <NumericFormat
                                            allowNegative={false}
                                            decimalScale={2}
                                            defaultValue={0}
                                            fixedDecimalScale={true}
                                            {...register(`productLineItems.${index}.price`)}
                                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                            onValueChange={(values) => setValue(`productLineItems.${index}.price`, values.floatValue || 0, { shouldValidate: true, shouldDirty: true })}
                                            thousandSeparator={true}
                                            value={watch(`productLineItems.${index}.price`)}
                                            className="border p-2 rounded w-full text-right" />
                                    </td>
                                    {/* amount */}
                                    <td className="p-2 border">
                                        <NumericFormat
                                            allowNegative={false}
                                            disabled
                                            readOnly
                                            decimalScale={2}
                                            defaultValue={0}
                                            fixedDecimalScale={true}
                                            // {...register(`productLineItems.${index}.amount`)}
                                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                            thousandSeparator={true}
                                            // onValueChange={(values) => setValue(`productLineItems.${index}.amount`, values.floatValue || 0, { shouldValidate: true, shouldDirty: true })}
                                            value={amount}
                                            className="border p-2 rounded w-full text-right bg-gray-100" />
                                    </td>
                                    {/* line remarks */}
                                    <td className="p-2 border">
                                        <textarea {...register(`productLineItems.${index}.lineRemarks`)} className="border p-2 rounded w-full text-xs" />
                                    </td>
                                    {/* serial no */}
                                    <td className="p-2 border">
                                        <input type="text" {...register(`productLineItems.${index}.serialNo`)} className="border p-2 rounded w-full" />
                                    </td>
                                    {/* delete */}
                                    <td className="p-2 border">
                                        <button type="button" onClick={() => handleDeleteRow(index)} className="text-red-500">
                                            <IconDelete />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Footer Row */}
                    <tfoot>
                        <tr className="bg-gray-200 font-semibold text-primary-500">
                            <td colSpan={2}>
                                <button type="button" onClick={() => append({ productId: undefined, productCode: "", productDetails: "", lineRefNo: "", qty: 1, price: 0, amount: 0, lineRemarks: "", serialNo: "" })} className="px-2 py-2 bg-blue-500 text-white rounded w-36 flex items-center gap-2">
                                    <IconPlus />
                                    Add Product
                                </button>
                            </td>
                            <td className="p-2 border text-right" colSpan={2}>Total</td>
                            {/* Total Qty */}
                            <td className="p-2 border text-right">
                                <NumericFormat
                                    value={fields.reduce((sum, _, index) =>
                                        new Decimal(sum).plus(watch(`productLineItems.${index}.qty`) || 0).toNumber()
                                        , 0)}
                                    displayType="text"
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                />
                            </td>
                            <td className="p-2 border"></td>
                            {/* Total Amount */}
                            <td className="p-2 border text-right">
                                <NumericFormat
                                    value={fields.reduce((sum, _, index) => {
                                        const qty = new Decimal(watch(`productLineItems.${index}.qty`) || 0);
                                        const price = new Decimal(watch(`productLineItems.${index}.price`) || 0);
                                        return sum.plus(qty.times(price));
                                    }, new Decimal(0)).toNumber()}
                                    displayType="text"
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                />
                            </td>
                            <td className="p-2 border" colSpan={3}></td>
                        </tr>
                    </tfoot>
                </table>

            </div>
        </form>
    </div>)

    function handleDeleteRow(index: number) {
        const productLineItems = watch('productLineItems')
        if (productLineItems.length === 1) {
            Utils.showAlertMessage('Oops!', Messages.messMustKeepOneRow)
            return
        }
        remove(index)
    }

    function handleOnBlurProductCode(index: number) {
        console.log(index)
        // Utils.showHideModalDialogA({
        //     isOpen: true,
        //     size: 'lg',
        //     element: <ProductSelectFromGrid />,
        //     title: 'Select a product'
        // })
    }

    function handleOnChangeDestBranch() {

    }

    function handleProductClear(index: number) {
        setValue(`productLineItems.${index}.productCode`, '')
        setValue(`productLineItems.${index}.productDetails`, '')
        setValue(`productLineItems.${index}.lineRefNo`, '')
        setValue(`productLineItems.${index}.qty`, 1)
        setValue(`productLineItems.${index}.price`, 0)
        setValue(`productLineItems.${index}.lineRemarks`, '')
        setValue(`productLineItems.${index}.serialNo`, '')
    }

    function handleProductSearch(index: number) {
        console.log(index)
        Utils.showHideModalDialogA({
            isOpen: true,
            size: 'lg',
            element: <ProductSelectFromGrid onSelect={onSelect} />,
            title: 'Select a product'
        })

        function onSelect(args: ProductInfoType) {
            setValue(`productLineItems.${index}.productCode`, args.productCode)
            setValue(`productLineItems.${index}.id`, args.id)
            setValue(`productLineItems.${index}.productDetails`, `${args.brandName} ${args.catName} ${args.label} ${args.info ?? ''}`)
            setValue(`productLineItems.${index}.price`, args.lastPurchasePriceGst)
        }
    }

    function handleReset() {

    }

    async function onSubmit(data: BranchTransferType) {
        console.log(data)
    }

}

type BranchTransferType = {
    id?: string | number
    autoRefNo?: string
    destBranchId?: number
    productLineItems: ProductLineItem[]
    remarks?: string
    tranDate: string
    userRefNo?: string
}

type ProductLineItem = {
    id?: number | string
    amount: number
    jData?: { [key: string]: any }
    price: number
    lineRefNo: string
    lineRemarks: string
    productCode: string
    productDetails: string
    productId?: number
    serialNo: string
    qty: number
}