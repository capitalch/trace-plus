import React, { useState, useEffect, useMemo } from 'react';
import clsx from "clsx";
import _ from "lodash";
import { NumericFormat } from "react-number-format";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { ProductInfoType, ProductSelectFromGrid } from "../../../../../controls/components/product-select-from-grid";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { IconCross } from "../../../../../controls/icons/icon-cross";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { AnimatePresence, motion } from "framer-motion";

interface Item {
    id: number;
    productId?: number;
    productCode: string;
    upcCode?: string;
    productDetails?: string;
    hsn: string;
    gst: number;
    qty: number;
    price: number;
    gstPrice: number;
    discount: number;
    remarks: string;
    serialNo: string;
}

const ItemsAndServices: React.FC = () => {
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
    const [roundOff, setRoundOff] = useState<number>(0);
    const [backCalcTarget, setBackCalcTarget] = useState<number>(0);
    const [items, setItems] = useState<Item[]>([
        { id: 1, productCode: '', hsn: '', gst: 0, qty: 1, price: 0, gstPrice: 0, discount: 0, remarks: '', serialNo: '' }
    ]);
    const handleAddRow = (index: number) => {
        const newItem = {
            id: Date.now(), // Use timestamp for unique id
            productCode: '',
            hsn: '',
            gst: 0,
            qty: 1,
            price: 0,
            gstPrice: 0,
            discount: 0,
            remarks: '',
            serialNo: ''
        };
        const newItems = [...items];
        newItems.splice(index + 1, 0, newItem);
        setItems(newItems);
        setTimeout(() => setCurrentRowIndex(index + 1), 0);
    };

    const handleClearAll = () => {
        setItems([{ id: Date.now(), productCode: '', hsn: '', gst: 0, qty: 1, price: 0, gstPrice: 0, discount: 0, remarks: '', serialNo: '' }]);
        setTimeout(() => setCurrentRowIndex(0), 0);
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const onChangeProductCode = useMemo(
        () =>
            _.debounce((value: string, itemId: number) => {
                populateProductOnProductCode(value, itemId);
            }, 2000), []
    );

    useEffect(() => {
        return () => onChangeProductCode.cancel();
    }, [onChangeProductCode]);

    async function populateProductOnProductCode(productCode: string, itemId: number) {
        if (!productCode) {
            handleClearLineItem(itemId);
            return;
        }
        const products: ProductInfoType[] = await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getProductOnProductCodeUpc,
            sqlArgs: {
                productCodeOrUpc: productCode
            }
        });
        const product = products?.[0];
        if (_.isEmpty(product)) {
            handleClearLineItem(itemId);
            return;
        }
        setLineItem(product, itemId);
    }

    function setLineItem(product: ProductInfoType, itemId: number) {
        setItems(items.map(item =>
            item.id === itemId ? {
                ...item,
                productId: product.productId,
                productCode: product.productCode,
                productDetails: `${product.brandName} ${product.catName} ${product.label}`,
                hsn: product.hsn ? product.hsn.toString() : '',
                gst: product.gstRate,
                price: product.salePrice,
                upcCode: product.upcCode
            } : item
        ));
    }

    function handleClearLineItem(itemId: number) {
        setItems(items.map(item =>
            item.id === itemId ? {
                ...item,
                productId: undefined,
                productCode: '',
                upcCode: undefined,
                productDetails: undefined,
                hsn: '',
                gst: 0,
                price: 0
            } : item
        ));
    }

    function handleProductSearch(itemId: number) {
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <ProductSelectFromGrid onSelect={(product) => setLineItem(product, itemId)} />,
            title: "Select a product"
        });
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = (item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100);
            return sum + itemTotal;
        }, 0);
        const cgst = subtotal * 0.09;
        const sgst = subtotal * 0.09;
        const igst = 0;
        const total = subtotal + cgst + sgst + igst + roundOff;

        return {
            subtotal: subtotal.toFixed(2),
            cgst: cgst.toFixed(2),
            sgst: sgst.toFixed(2),
            igst: igst.toFixed(2),
            total: total.toFixed(2),
            totalBeforeRoundOff: (subtotal + cgst + sgst + igst).toFixed(2)
        };
    };

    const handleRoundOff = () => {
        const totals = calculateTotals();
        const totalBeforeRoundOff = parseFloat(totals.totalBeforeRoundOff);
        const roundedTotal = Math.round(totalBeforeRoundOff);
        const roundOffValue = roundedTotal - totalBeforeRoundOff;
        setRoundOff(roundOffValue);
    };

    const handleRemoveRoundOff = () => {
        setRoundOff(0);
    };

    const handleBackCalc = () => {
        if (backCalcTarget <= 0) {
            Utils.showErrorMessage("Please enter a valid target amount");
            return;
        }

        const currentTotals = calculateTotals();
        const currentTotal = parseFloat(currentTotals.totalBeforeRoundOff);
        
        if (currentTotal <= 0) {
            Utils.showErrorMessage("No items to calculate backwards from");
            return;
        }

        // Calculate the adjustment factor
        const adjustmentFactor = (backCalcTarget - roundOff) / currentTotal;
        
        // Adjust prices proportionally
        const updatedItems = items.map(item => {
            if (item.price > 0) {
                return {
                    ...item,
                    price: parseFloat((item.price * adjustmentFactor).toFixed(2))
                };
            }
            return item;
        });

        setItems(updatedItems);
        // Clear the input after successful calculation
        setBackCalcTarget(0);
    };

    const totals = calculateTotals();

    return (
        <AnimatePresence>
            <div className="flex flex-col -mt-4">
                <label className="font-medium">Items & Services</label>
                
                {/* Summary */}
                {getSummaryMarkup()}

                {items.map((item, index) => {
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className={
                                clsx(
                                    "flex flex-wrap items-start mt-2 p-2 gap-2 border border-gray-200 rounded-md cursor-pointer",
                                    currentRowIndex === index ? "bg-green-50 border-2 border-teal-600" : "bg-white"
                                )}
                            onClick={() => setCurrentRowIndex(index)}
                        >
                            {/* Index */}
                            <div className="flex flex-col w-10 text-xs">
                                <label className="font-semibold">#</label>
                                <span className="mt-2">{index + 1}</span>
                                <button
                                    aria-label="Clear Line Item"
                                    tabIndex={-1}
                                    type="button"
                                    onClick={() => handleClearLineItem(item.id)}
                                    className="mt-5.5 text-blue-500"
                                >
                                    <IconClear className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Prod Code | UPC */}
                            <div className="flex flex-col w-28 text-xs">
                                <label className="font-semibold text-xs">Prod Code | UPC</label>
                                <input
                                    value={item.productCode}
                                    onChange={(e) => {
                                        updateItem(item.id, 'productCode', e.target.value);
                                        onChangeProductCode(e.target.value, item.id);
                                    }}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    className={clsx(inputFormFieldStyles, 'mt-1 h-8')}
                                />
                                <button
                                    tabIndex={-1}
                                    type="button"
                                    className="flex items-center mt-1.5 py-1 w-full font-medium text-teal-800 border border-teal-100 rounded-md transition-all duration-200 hover:bg-teal-200 hover:border-teal-400 hover:text-teal-900 group"
                                    onClick={() => handleProductSearch(item.id)}
                                    title="Search products"
                                >
                                    <IconSearch className="mr-1.5 ml-1 w-4 h-4" />
                                    <span className='text-[16px]'>Search</span>
                                </button>
                                <span className="mt-1 text-teal-500 text-xs">
                                    {item.upcCode || "-----------------------"}
                                </span>
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col w-40 text-xs">
                                <label className="font-semibold">Details</label>
                                <textarea
                                    rows={5}
                                    tabIndex={-1}
                                    value={item.productDetails || ''}
                                    readOnly
                                    className={clsx("mt-1 text-xs bg-gray-100", inputFormFieldStyles)}
                                />
                            </div>

                            {/* Remarks */}
                            <div className="flex flex-col w-36 text-xs">
                                <label className="font-semibold">Remarks</label>
                                <textarea
                                    value={item.remarks}
                                    onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                                    rows={4}
                                    className={clsx("mt-1 text-sm", inputFormFieldStyles)}
                                />
                            </div>

                            {/* HSN | GST Rate */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex flex-col w-24 text-xs">
                                    <label className="font-semibold">HSN</label>
                                    <NumericFormat
                                        value={item.hsn}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        allowNegative={false}
                                        decimalScale={0}
                                        className={clsx(inputFormFieldStyles, 'mt-1 h-8 text-right')}
                                        onValueChange={({ value }) => {
                                            updateItem(item.id, 'hsn', value);
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col w-24 text-xs">
                                    <label className="font-semibold">GST %</label>
                                    <NumericFormat
                                        value={item.gst}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        thousandSeparator={false}
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        isAllowed={(values) => {
                                            const { floatValue } = values;
                                            return !floatValue || floatValue <= 28;
                                        }}
                                        className={clsx("mt-1 h-8 text-right", inputFormFieldStyles)}
                                        onValueChange={({ floatValue }) => {
                                            updateItem(item.id, 'gst', floatValue ?? 0);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Qty */}
                            <div className="flex flex-col w-20 text-xs">
                                <label className="font-semibold">Qty</label>
                                <NumericFormat
                                    value={item.qty}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        const value = floatValue || 0;
                                        if (value > 0) {
                                            updateItem(item.id, 'qty', value);
                                        }
                                    }}
                                />
                            </div>

                            {/* Price */}
                            <div className="flex flex-col w-30 text-xs">
                                <label className="font-semibold">Price</label>
                                <NumericFormat
                                    value={item.price}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        updateItem(item.id, 'price', floatValue ?? 0);
                                    }}
                                />
                            </div>

                            {/* Discount */}
                            <div className="flex flex-col w-24 text-xs">
                                <label className="font-semibold">Discount(unit)</label>
                                <NumericFormat
                                    value={item.discount}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        updateItem(item.id, 'discount', floatValue ?? 0);
                                    }}
                                />
                            </div>

                            {/* Price GST */}
                            <div className="flex flex-col w-30 text-xs">
                                <label className="font-semibold">Price GST</label>
                                <NumericFormat
                                    value={item.gstPrice}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        updateItem(item.id, 'gstPrice', floatValue ?? 0);
                                    }}
                                />
                            </div>

                            {/* Serials */}
                            <div className="flex flex-col w-40 text-xs">
                                <label className="font-semibold">Serials</label>
                                <textarea
                                    value={item.serialNo}
                                    onChange={(e) => updateItem(item.id, 'serialNo', e.target.value)}
                                    rows={4}
                                    placeholder="Comma-separated serials"
                                    className={clsx("mt-1 text-sm", inputFormFieldStyles)}
                                />
                            </div>

                            {/* Amount and Actions */}
                            <div className="flex flex-col ml-auto w-32">
                                <NumericFormat
                                    value={((item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100))}
                                    fixedDecimalScale
                                    thousandSeparator
                                    decimalScale={2}
                                    disabled
                                    readOnly
                                    className={clsx("border-0 text-right font-bold text-gray-900 bg-gray-50 ", inputFormFieldStyles)}
                                />
                                <div className="flex items-center justify-center mt-4 ml-auto gap-8">
                                    {/* delete */}
                                    <button
                                        type="button"
                                        className={clsx("text-red-500", items.length === 1 && "cursor-not-allowed opacity-30")}
                                        onClick={() => {
                                            if (items.length > 1) {
                                                const newItems = items.filter(i => i.id !== item.id);
                                                setItems(newItems);
                                                setTimeout(() => {
                                                    if (index === 0) {
                                                        setCurrentRowIndex(0);
                                                    } else {
                                                        setCurrentRowIndex(index - 1);
                                                    }
                                                }, 0);
                                            }
                                        }}
                                        disabled={items.length === 1}
                                    >
                                        <IconCross className="w-7 h-7" />
                                    </button>
                                    {/* add */}
                                    <button
                                        type="button"
                                        className="p-2.5 text-white ring-2 ring-emerald-200 rounded-full shadow-lg transition-all duration-300 hover:from-emerald-600 hover:ring-emerald-300 hover:scale-105 hover:shadow-xl hover:to-teal-700 bg-gradient-to-r from-emerald-500 to-teal-600"
                                        onClick={() => handleAddRow(index)}
                                        title="Add new row"
                                    >
                                        <IconPlus className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Summary */}
                {getSummaryMarkup()}
            </div>
        </AnimatePresence>
    );

    function getSummaryMarkup() {
        return (
            <div className="flex flex-wrap items-center mt-2 py-2 w-full font-medium bg-gray-50 border border-gray-200 rounded">
                {/* Left side - Controls and stats */}
                <div className="flex flex-wrap items-center flex-1 gap-4">
                    {/* Clear All Button */}
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="flex items-center ml-2 px-4 py-1 text-gray-500 text-sm bg-amber-100 rounded-sm hover:bg-amber-200 gap-1"
                    >
                        <IconClear1 className="w-3 h-3" />
                        Clear
                    </button>

                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">Items:</span>
                        <span>{items.length}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">Qty:</span>
                        <span>{Utils.toDecimalFormat(items.reduce((sum, item) => sum + (item.qty || 0), 0))}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">SubT:</span>
                        <span>{parseFloat(totals.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">CGST:</span>
                        <span>{Utils.toDecimalFormat(parseFloat(totals.cgst))}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">SGST:</span>
                        <span>{Utils.toDecimalFormat(parseFloat(totals.sgst))}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">IGST:</span>
                        <span>{Utils.toDecimalFormat(parseFloat(totals.igst))}</span>
                    </div>
                    
                    {/* Round Off Display */}
                    {roundOff !== 0 && (
                        <div className="flex text-right text-xs gap-1">
                            <span className="text-gray-500">RndOff:</span>
                            <span className={roundOff >= 0 ? "text-green-600" : "text-red-600"}>
                                {roundOff >= 0 ? '+' : ''}{Utils.toDecimalFormat(roundOff)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Center - Controls */}
                <div className="flex items-center gap-1">
                    {/* Round Off Button */}
                    <button
                        type="button"
                        onClick={handleRoundOff}
                        className="px-2 py-1 font-semibold text-blue-700 text-sm bg-blue-100 rounded transition-colors hover:bg-blue-200"
                    >
                        Round Off
                    </button>
                    {roundOff !== 0 && (
                        <button
                            type="button"
                            onClick={handleRemoveRoundOff}
                            className="px-2 py-1 font-semibold text-gray-700 bg-gray-100 rounded transition-colors hover:bg-gray-200"
                        >
                            Remove
                        </button>
                    )}

                    {/* Back Calc Section */}
                    <div className="flex items-center px-2 py-1 bg-white border border-gray-200 rounded gap-1">
                        <button
                            type="button"
                            onClick={handleBackCalc}
                            className="px-2 py-1 font-semibold text-sm text-white bg-teal-500 rounded transition-colors hover:bg-teal-600"
                        >
                            Back Cal
                        </button>
                        <NumericFormat
                            value={backCalcTarget}
                            thousandSeparator
                            decimalScale={2}
                            fixedDecimalScale
                            placeholder="Amount"
                            className="px-1 py-0.5 w-30 font-normal text-right text-x border border-gray-300 rounded focus:border-teal-500 focus:outline-none"
                            onValueChange={({ floatValue }) => {
                                setBackCalcTarget(floatValue ?? 0);
                            }}
                        />
                    </div>
                </div>

                {/* Right side - Total Amount */}
                <div className="flex items-center ml-2 px-3 py-1 bg-green-50 border-l-2 border-teal-300 rounded gap-1">
                    <span className="font-black text-gray-700 text-sm">Total:</span>
                    <strong className="font-black text-base text-green-700">{Utils.toDecimalFormat(parseFloat(totals.total))}</strong>
                </div>
            </div>
        );
    }
};

export default ItemsAndServices;