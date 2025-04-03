import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Messages } from "../../../../../utils/messages";
import { UseFormClearErrors, UseFormSetValue, UseFormTrigger, UseFormWatch } from "react-hook-form";
import { StockJournalType } from "./stock-journal-main";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { Utils } from "../../../../../utils/utils";
import { ProductInfoType, ProductSelectFromGrid } from "../../../../../controls/components/product-select-from-grid";
import _ from "lodash";
import { ProductType } from "../../shared-types";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../../app/store/store";

export function useStockJournalLineItems(
    name: "sourceLineItems" | "outputLineItems",
    instance: string,
    clearErrors: UseFormClearErrors<StockJournalType>,
    setValue: UseFormSetValue<StockJournalType>,
    trigger: UseFormTrigger<StockJournalType>,
    watch: UseFormWatch<StockJournalType>
) {
    const [srNoTooltipIndex, setSrNoTooltipIndex] = useState<number | null>(null);
    const { buCode, context, dbName, decodedDbParamsObject, } = useUtilsInfo();

    const onChangeProductCode = useMemo(
        // For debounce
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>, index: number) => {
                populateProductOnProductCode(e.target.value, index);
            }, 2000), [name]
    );
    useEffect(() => {
        return () => onChangeProductCode.cancel();
    }, [onChangeProductCode]);

    useEffect(() => {
        return () => {
            if (context.DataInstances?.[instance]) {
                context.DataInstances[instance].deletedIds = [];
            }
        };
    }, []);

    function errorIndicatorAndTooltipForSerialNumber(index: number) {
        const snError = getSnError(index);
        if (!snError) {
            return true;
        }
        return (
            <div className="absolute top-0 right-0">
                <button
                    aria-label="Error Tooltip"
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
                        {!snError || Messages.errQtySrNoNotMatch}
                    </div>
                )}
            </div>
        );
    }

    function getSnError(index: number) {
        const serialNumbers = watch(`${name}.${index}.serialNumbers`);
        const sn = serialNumbers ? serialNumbers.replace(/[,;]$/, "") : "";
        const snCount = sn ? sn.split(/[,;]/).length : 0;
        const qty = watch(`${name}.${index}.qty`);
        let snError = undefined;
        if (snCount !== 0 && snCount !== qty) {
            snError = Messages.errQtySrNoNotMatch;
        }
        return snError;
    }

    function handleDeleteRow(index: number, remove: any) {
        const id = watch(`${name}.${index}.id`);
        if (id) {
            if (!context.DataInstances?.[instance]) {
                context.DataInstances[instance] = { deletedIds: [] };
            }
            context.DataInstances[instance].deletedIds.push(id);
        }
        remove(index);
    }

    function handleProductClear(index: number) {
        setValue(`${name}.${index}.productId`, undefined);
        setValue(`${name}.${index}.productCode`, null);
        setValue(`${name}.${index}.productDetails`, null);
        setValue(`${name}.${index}.lineRefNo`, null);
        setValue(`${name}.${index}.qty`, 1);
        setValue(`${name}.${index}.price`, 0);
        setValue(`${name}.${index}.lineRemarks`, null);
        setValue(`${name}.${index}.tranHeaderId`, undefined);
        setValue(`${name}.${index}.serialNumbers`, null);
        setValue(`${name}.${index}.upcCode`, null);
    }

    function handleProductSearch(index: number) {
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <ProductSelectFromGrid onSelect={onProductSelect} />,
            title: "Select a product"
        });

        function onProductSelect(args: ProductInfoType) {
            clearErrors(`${name}.${index}.productCode`);
            setValue(`${name}.${index}.productCode`, args.productCode);
            setValue(`${name}.${index}.productId`, args.id, {
                shouldValidate: true,
                shouldDirty: true
            });
            setValue(
                `${name}.${index}.productDetails`,
                `${args.brandName} ${args.catName} ${args.label} ${args.info ?? ""}`
            );
            setValue(`${name}.${index}.price`, args.lastPurchasePrice);
            setValue(`${name}.${index}.upcCode`, args.upcCode);
        }
    }

    async function populateProductOnProductCode(
        productCode: string,
        index: number
    ) {
        if (_.isEmpty(productCode)) {
            handleProductClear(index);
            trigger(`${name}.${index}.productCode`);
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
            trigger(`${name}.${index}.productCode`);
            return;
        }
        clearErrors(`${name}.${index}.productCode`);
        setValue(`${name}.${index}.productCode`, product[0].productCode);
        setValue(`${name}.${index}.productId`, product[0].productId);
        setValue(
            `${name}.${index}.productDetails`,
            `${product[0].brandName} ${product[0].catName} ${product[0].label} ${product[0].info ?? ""
            }`
        );
        setValue(`${name}.${index}.price`, product[0].lastPurchasePrice);
        setValue(`${name}.${index}.upcCode`, product[0].upcCode);
    }

    return ({
        errorIndicatorAndTooltipForSerialNumber,
        getSnError,
        handleDeleteRow,
        handleProductClear,
        handleProductSearch,
        onChangeProductCode,
        // populateProductOnProductCode,
    })
}
