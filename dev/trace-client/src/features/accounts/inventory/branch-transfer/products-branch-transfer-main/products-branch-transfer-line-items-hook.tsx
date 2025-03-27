import { useState } from "react";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { useFormContext } from "react-hook-form";
import { BranchTransferType } from "./products-branch-transfer-main";
import { Messages } from "../../../../../utils/messages";
import { Utils } from "../../../../../utils/utils";
import {
  ProductInfoType,
  ProductSelectFromGrid
} from "../../../../../controls/components/product-select-from-grid";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import _ from "lodash";

export function useProductsBranchTransferLineItems(instance: string) {
  const [qtyTooltipIndex, setQtyTooltipIndex] = useState<number | null>(null);
  const [srNoTooltipIndex, setSrNoTooltipIndex] = useState<number | null>(null);
  const [productIdTooltipIndex, setProductIdTooltipIndex] = useState<
    number | null
  >(null);
  const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();
  const {
    clearErrors,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useFormContext<BranchTransferType>();

  function errorIndicatorAndTooltipForProductId(index: number) {
    const productId = watch(`productLineItems.${index}.productId`);
    if (productId) {
      return true;
    }
    return (
      <div className="absolute top-0 right-0">
        <button
          aria-label="Error Tooltip"
          tabIndex={-1}
          type="button"
          className="relative"
          onClick={() => {
            setProductIdTooltipIndex(
              productIdTooltipIndex === index ? null : index
            );
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
      </div>
    );
  }

  function errorIndicatorAndTooltipForQty(index: number) {
    const qty = watch(`productLineItems.${index}.qty`);
    if (qty || qty === undefined) {
      return true;
    }
    return (
      <div className="absolute top-0 right-0">
        <button
          aria-label="Error Tooltip"
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
    const serialNumbers = watch(`productLineItems.${index}.serialNumbers`);
    const sn = serialNumbers ? serialNumbers.replace(/[,;]$/, "") : "";
    const snCount = sn ? sn.split(/[,;]/).length : 0;
    const qty = watch(`productLineItems.${index}.qty`);
    let snError = undefined;
    if (snCount !== 0 && snCount !== qty) {
      // snError = true;
      snError = Messages.errQtySrNoNotMatch;
    }
    return snError;
  }

  function handleDeleteRow(index: number, remove: any) {
    const productLineItems = watch("productLineItems");
    const id = watch(`productLineItems.${index}.id`);
    if (productLineItems.length === 1) {
      Utils.showAlertMessage("Oops!", Messages.messMustKeepOneRow);
      return;
    }
    if (id) {
      console.log(id);
      if (!context.DataInstances?.[instance]) {
        context.DataInstances[instance] = { deletedIds: [] };
      }
      context.DataInstances[instance].deletedIds.push(id);
    }
    remove(index);
  }

  function handleProductClear(index: number) {
    setValue(`productLineItems.${index}.productId`, undefined);
    setValue(`productLineItems.${index}.productCode`, null);
    setValue(`productLineItems.${index}.productDetails`, null);
    setValue(`productLineItems.${index}.lineRefNo`, null);
    setValue(`productLineItems.${index}.qty`, 1);
    setValue(`productLineItems.${index}.price`, 0);
    setValue(`productLineItems.${index}.lineRemarks`, null);
    setValue(`productLineItems.${index}.tranHeaderId`, undefined);
    setValue(`productLineItems.${index}.serialNumbers`, null);
    setValue(`productLineItems.${index}.upcCode`, null);
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

  async function populateProductOnProductCode(
    productCode: string,
    index: number
  ) {
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
      return;
    }
    clearErrors(`productLineItems.${index}.productCode`);
    setValue(`productLineItems.${index}.productCode`, product[0].productCode);
    setValue(`productLineItems.${index}.productId`, product[0].productId);
    setValue(
      `productLineItems.${index}.productDetails`,
      `${product[0].brandName} ${product[0].catName} ${product[0].label} ${
        product[0].info ?? ""
      }`
    );
    setValue(`productLineItems.${index}.price`, product[0].lastPurchasePrice);
    setValue(`productLineItems.${index}.upcCode`, product[0].upcCode);
  }

  function validateSerialNumbers(input: string | null, index: number) {
    if (!input) {
      return true;
    }
    const snError = getSnError(index);
    return snError;
  }

  return {
    errorIndicatorAndTooltipForProductId,
    errorIndicatorAndTooltipForQty,
    errorIndicatorAndTooltipForSerialNumber,
    getSnError,
    handleDeleteRow,
    handleProductClear,
    handleProductSearch,
    populateProductOnProductCode,
    validateSerialNumbers
  };
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
