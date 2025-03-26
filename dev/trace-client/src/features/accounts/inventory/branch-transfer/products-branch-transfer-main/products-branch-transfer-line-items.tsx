import { BranchTransferType } from "./products-branch-transfer-main";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { NumericFormat } from "react-number-format";
import { Messages } from "../../../../../utils/messages";
import clsx from "clsx";
import { IconDelete } from "../../../../../controls/icons/icon-delete";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import Decimal from "decimal.js";
import { Utils } from "../../../../../utils/utils";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import _ from "lodash";
import {
    ProductInfoType,
    ProductSelectFromGrid
} from "../../../../../controls/components/product-select-from-grid";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";

export function ProductLineItems() {
    const [qtyTooltipIndex, setQtyTooltipIndex] = useState<number | null>(null);
    const [srNoTooltipIndex, setSrNoTooltipIndex] = useState<number | null>(null);
    const [productIdTooltipIndex, setProductIdTooltipIndex] = useState<number | null>(null);
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const {
        clearErrors,
        control,
        watch,
        register,
        setValue,
        trigger,
        formState: { errors }
    } = useFormContext<BranchTransferType>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "productLineItems"
    });

    const onChangeProductCode = useMemo( // For debounce
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>, index: number) => {
                populateProductOnProductCode(e.target.value, index);
            }, 1500),
        []
    )
    useEffect(() => {
        return (() => onChangeProductCode.cancel())
    }, [onChangeProductCode])

    return (
        <div className="">
            <label className="font-medium">Products</label>
            <table className="w-full border-collapse mt-2">
                <thead>
                    <tr className="bg-gray-100 text-primary-500">
                        <th className="p-2 border w-10">#</th>
                        <th className="p-2 border w-32 text-xs font-medium">
                            UPC / Product Code
                        </th>
                        <th className="p-2 border w-xs">Product Details</th>
                        <th className="p-2 border w-36">Line Ref No</th>
                        <th className="p-2 border">Line Remarks</th>
                        <th className="p-2 border w-28 text-right">Qty</th>
                        <th className="p-2 border w-40 text-right">Price</th>
                        <th className="p-2 border">Serial Numbers</th>
                        <th className="p-2 border w-36 text-right">Amount</th>
                        <th className="p-2 border"></th>
                    </tr>
                </thead>
                <tbody>
                    {fields.map((item, index) => {
                        const qty = watch(`productLineItems.${index}.qty`);
                        const price = watch(`productLineItems.${index}.price`);
                        const productId = watch(`productLineItems.${index}.productId`);
                        const amount = qty * price;
                        const sn = watch(`productLineItems.${index}.serialNumbers`).replace(
                            /[,;]$/,
                            ""
                        );
                        const snCount = sn ? sn.split(/[,;]/).length : 0;
                        const snError = snCount !== 0 && snCount !== qty;

                        return (
                            <tr key={item.id} className="border">
                                {/* index */}
                                <td className="p-2 border">{index + 1}</td>

                                {/* product code */}
                                <td className="p-2 border flex flex-col relative">
                                    <span tabIndex={-1} className="text-xs -mt-2 text-blue-500 text-center">
                                        {watch(`productLineItems.${index}.upcCode`) ||
                                            "------------"}
                                    </span>
                                    <div className="flex items-center align-middle justify-center">
                                        <input
                                            type="text"
                                            {...register(`productLineItems.${index}.productCode`,
                                                {
                                                    onChange: (e) => onChangeProductCode(e, index),
                                                    validate: () => {
                                                        const productId = watch(`productLineItems.${index}.productId`);
                                                        return (productId ? true : Messages.errProductNotSelected)
                                                    },
                                                })}
                                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                            value={watch(`productLineItems.${index}.productCode`)}
                                            className={clsx("border p-2 rounded w-full", inputFormFieldStyles, productId ? "" : "border-red-500 bg-red-100")}

                                        />
                                        <div className="flex flex-col gap-2">
                                            <button
                                                aria-label="Search Product"
                                                tabIndex={-1}
                                                type="button"
                                                onClick={() => handleProductSearch(index)}
                                                className="ml-2 text-blue-500"
                                            >
                                                <IconSearch />
                                            </button>
                                            <button
                                                aria-label="Clear Product"
                                                tabIndex={-1}
                                                type="button"
                                                onClick={() => handleProductClear(index)}
                                                className="ml-2 text-blue-500"
                                            >
                                                <IconClear />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Error Indicator & Tooltip Button */}
                                    {errorIndicatorAndTooltipForProductId(index)}
                                </td>

                                {/* product details */}
                                <td className="p-2 border font-semibold">
                                    <textarea
                                        tabIndex={-1}
                                        rows={3}
                                        {...register(`productLineItems.${index}.productDetails`)}
                                        className={clsx("border px-2 py-0.5 rounded w-full bg-gray-100 text-xs", inputFormFieldStyles)}
                                        readOnly
                                    />
                                </td>

                                {/* ref no */}
                                <td className="p-2 border">
                                    <input
                                        type="text"
                                        {...register(`productLineItems.${index}.lineRefNo`)}
                                        className={clsx("border p-2 rounded w-full text-xs", inputFormFieldStyles)}
                                    />
                                </td>

                                {/* line remarks */}
                                <td className="p-2 border">
                                    <textarea
                                        rows={3}
                                        {...register(`productLineItems.${index}.lineRemarks`)}
                                        className={clsx("border p-2 rounded w-full text-xs", inputFormFieldStyles)}
                                    />
                                </td>

                                {/* qty */}
                                <td className="p-2 border relative">
                                    <NumericFormat
                                        allowNegative={false}
                                        decimalScale={2}
                                        defaultValue={0}
                                        fixedDecimalScale={true}
                                        {...register(`productLineItems.${index}.qty`, {
                                            validate: (value) =>
                                                value !== 0 || Messages.errQtyCannotBeZero
                                        })}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        onValueChange={(values) =>
                                            setValue(
                                                `productLineItems.${index}.qty`,
                                                values.floatValue ?? 0,
                                                { shouldValidate: true, shouldDirty: true }
                                            )
                                        }
                                        thousandSeparator={true}
                                        value={watch(`productLineItems.${index}.qty`)}
                                        className={clsx(
                                            "border p-2 rounded w-full text-right", inputFormFieldStyles,
                                            qty === 0 ? "border-red-500 bg-red-100" : ""
                                        )}
                                    />
                                    {/* Error Indicator & Tooltip Button */}
                                    {errorIndicatorAndTooltipForQty(index)}
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
                                        onValueChange={(values) =>
                                            setValue(
                                                `productLineItems.${index}.price`,
                                                values.floatValue || 0,
                                                { shouldValidate: true, shouldDirty: true }
                                            )
                                        }
                                        thousandSeparator={true}
                                        value={watch(`productLineItems.${index}.price`)}
                                        className={clsx("border p-2 rounded w-full text-right", inputFormFieldStyles)}
                                    />
                                </td>

                                {/* serial numbers */}
                                <td className="p-2 border relative">
                                    <textarea
                                        {...register(`productLineItems.${index}.serialNumbers`, {
                                            validate: (input: string) =>
                                                validateSerialNumbers(input, index)
                                        })}
                                        rows={3}
                                        value={watch(`productLineItems.${index}.serialNumbers`)}
                                        className={clsx(
                                            "border p-2 rounded w-full", inputFormFieldStyles,
                                            snError ? "border-red-500 bg-red-100" : ""
                                        )}
                                        placeholder="Give comma separated serial numbers"
                                    />
                                    {/* Error Indicator & Tooltip Button */}
                                    {errorIndicatorAndTooltipForSerialNumber(index)}
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
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        thousandSeparator={true}
                                        value={amount}
                                        className="border p-2 rounded w-full text-right bg-gray-100"
                                    />
                                </td>

                                {/* delete */}
                                <td className="p-2 border">
                                    <button
                                        aria-label="Delete Row"
                                        tabIndex={-1}
                                        type="button"
                                        onClick={() => handleDeleteRow(index)}
                                        className="text-red-500"
                                    >
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
                            <button
                                type="button"
                                onClick={() =>
                                    append({
                                        productId: undefined,
                                        productCode: "",
                                        productDetails: "",
                                        lineRefNo: "",
                                        qty: 1,
                                        price: 0,
                                        amount: 0,
                                        lineRemarks: "",
                                        serialNumbers: "",
                                        upcCode: ""
                                    })
                                }
                                className="px-2 py-2 bg-blue-500 text-white rounded w-36 flex items-center gap-2"
                            >
                                <IconPlus />
                                Add Product
                            </button>
                        </td>
                        <td className="p-2 border text-right" colSpan={3}>
                            Total
                        </td>

                        {/* Total Qty */}
                        <td className="p-2 border text-right">
                            <NumericFormat
                                value={fields.reduce(
                                    (sum, _, index) =>
                                        new Decimal(sum)
                                            .plus(watch(`productLineItems.${index}.qty`) || 0)
                                            .toNumber(),
                                    0
                                )}
                                displayType="text"
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                            />
                        </td>
                        <td className="p-2 border"></td>
                        <td className="p-2 border"></td>

                        {/* Total Amount */}
                        <td className="p-2 border text-right">
                            <NumericFormat
                                value={fields
                                    .reduce((sum, _, index) => {
                                        const qty = new Decimal(
                                            watch(`productLineItems.${index}.qty`) || 0
                                        );
                                        const price = new Decimal(
                                            watch(`productLineItems.${index}.price`) || 0
                                        );
                                        return sum.plus(qty.times(price));
                                    }, new Decimal(0))
                                    .toNumber()}
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
    );

    function errorIndicatorAndTooltipForProductId(index: number) {
        const productId = watch(`productLineItems.${index}.productId`);
        if (productId) {
            return true;
        }
        return (
            <div className="absolute top-0 right-0">
                <button aria-label="Error Tooltip"
                    tabIndex={-1}
                    type="button"
                    className="relative"
                    onClick={() => {
                        setProductIdTooltipIndex(productIdTooltipIndex === index ? null : index);
                    }}
                    onBlur={() => {
                        setProductIdTooltipIndex(null);
                    }}
                >
                    <div
                        className="w-0 h-0 
                    border-t-11 border-t-red-500 
                    border-l-11 border-l-transparent 
                    border-b-0 border-r-0"
                    />
                </button>

                {/* Error Tooltip (Only shows for the clicked index) */}
                {productIdTooltipIndex === index && (
                    <div className="absolute right-0 top-2 bg-red-500 text-white text-xs p-2 rounded shadow-lg w-max z-10">
                        {errors?.productLineItems?.[index]?.productId?.message ||
                            Messages.errProductNotSelected}
                    </div>
                )}
            </div>);
    }

    function errorIndicatorAndTooltipForQty(index: number) {
        const qty = watch(`productLineItems.${index}.qty`);
        if (qty || qty === undefined) {
            return true;
        }
        return (
            <div className="absolute top-0 right-0">
                <button aria-label="Error Tooltip"
                    tabIndex={-1}
                    type="button"
                    className="relative"
                    onClick={() => {
                        setQtyTooltipIndex(qtyTooltipIndex === index ? null : index);
                    }}
                    onBlur={() => {
                        setQtyTooltipIndex(null);
                    }}
                >
                    <div
                        className="w-0 h-0 
                    border-t-11 border-t-red-500 
                    border-l-11 border-l-transparent 
                    border-b-0 border-r-0"
                    />
                </button>

                {/* Error Tooltip (Only shows for the clicked index) */}
                {qtyTooltipIndex === index && (
                    <div className="absolute right-0 top-2 bg-red-500 text-white text-xs p-2 rounded shadow-lg w-max z-10">
                        {errors?.productLineItems?.[index]?.qty?.message ||
                            Messages.errQtyCannotBeZero}
                    </div>
                )}
            </div>
        );
    }

    function errorIndicatorAndTooltipForSerialNumber(index: number) {
        const sn = watch(`productLineItems.${index}.serialNumbers`).replace(
            /[,;]$/,
            ""
        );
        const snCount = sn ? sn.split(/[,;]/).length : 0;
        const qty = watch(`productLineItems.${index}.qty`);
        const snError = snCount !== 0 && snCount !== qty;
        if (!snError) {
            return <></>;
        }
        return (
            <div className="absolute top-0 right-0">
                <button aria-label="Error Tooltip"
                    tabIndex={-1}
                    type="button"
                    className="relative"
                    onClick={() =>
                        setSrNoTooltipIndex(srNoTooltipIndex === index ? null : index)
                    }
                    onBlur={() => setSrNoTooltipIndex(null)}
                >
                    {/* Small red triangle indicator */}
                    <div
                        className="w-0 h-0 
                border-t-11 border-t-red-500 
                border-l-11 border-l-transparent 
                border-b-0 border-r-0"
                    />
                </button>

                {/* Error Tooltip (Only shows for the clicked index) */}
                {srNoTooltipIndex === index && (
                    <div className="absolute right-0 top-2 bg-red-500 text-white text-xs p-2 rounded shadow-lg w-max z-10">
                        {errors?.productLineItems?.[index]?.serialNumbers?.message ||
                            Messages.errQtySrNoNotMatch}
                    </div>
                )}
            </div>
        );
    }

    function handleDeleteRow(index: number) {
        const productLineItems = watch("productLineItems");
        if (productLineItems.length === 1) {
            Utils.showAlertMessage("Oops!", Messages.messMustKeepOneRow);
            return;
        }
        remove(index);
    }

    function handleProductClear(index: number) {
        setValue(`productLineItems.${index}.productId`, undefined);
        setValue(`productLineItems.${index}.productCode`, undefined);
        setValue(`productLineItems.${index}.productDetails`, undefined);
        setValue(`productLineItems.${index}.lineRefNo`, undefined);
        setValue(`productLineItems.${index}.qty`, 1);
        setValue(`productLineItems.${index}.price`, 0);
        setValue(`productLineItems.${index}.lineRemarks`, undefined);
        setValue(`productLineItems.${index}.serialNumbers`, '');
        setValue(`productLineItems.${index}.upcCode`, undefined);
    }

    function handleProductSearch(index: number) {
        console.log(index);
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <ProductSelectFromGrid onSelect={onProductSelect} />,
            title: "Select a product"
        });

        function onProductSelect(args: ProductInfoType) {
            setValue(`productLineItems.${index}.productCode`, args.productCode);
            setValue(`productLineItems.${index}.productId`, args.id);
            setValue(
                `productLineItems.${index}.productDetails`,
                `${args.brandName} ${args.catName} ${args.label} ${args.info ?? ""}`
            );
            setValue(`productLineItems.${index}.price`, args.lastPurchasePrice);
            setValue(`productLineItems.${index}.upcCode`, args.upcCode);
        }
    }

    async function populateProductOnProductCode(productCode: string, index: number) {
        if (_.isEmpty(productCode)) {
            handleProductClear(index);
            trigger(`productLineItems.${index}.productCode`);
            return;
        }
        const product: ProductType[] = await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getProductOnProductCodeUpc,
            sqlArgs: {
                productCodeOrUpc: productCode
            }
        });
        if (_.isEmpty(product)) {
            handleProductClear(index);
            trigger(`productLineItems.${index}.productCode`);
            return
        }
        clearErrors(`productLineItems.${index}.productCode`);
        setValue(`productLineItems.${index}.productCode`, product[0].productCode);
        setValue(`productLineItems.${index}.productId`, product[0].productId);
        setValue(
            `productLineItems.${index}.productDetails`,
            `${product[0].brandName} ${product[0].catName} ${product[0].label} ${product[0].info ?? ""
            }`
        );
        setValue(`productLineItems.${index}.price`, product[0].lastPurchasePrice);
        setValue(`productLineItems.${index}.upcCode`, product[0].upcCode);
    }

    function validateSerialNumbers(input: string, index: number) {
        if (!input) {
            return true;
        }
        let err = undefined;
        const snCount = input.split(/[,;]/).length;
        const qty = watch(`productLineItems.${index}.qty`);
        if (snCount !== qty) {
            err = Messages.errQtySrNoNotMatch;
        }
        return err;
    }
}

type ProductType = {
    brandName: string;
    catName: string;
    gstRate: number;
    hsn: number;
    info: string;
    label: string;
    lastPurchasePrice: number;
    productCode: string;
    productId: number;
    upcCode: string;
};
