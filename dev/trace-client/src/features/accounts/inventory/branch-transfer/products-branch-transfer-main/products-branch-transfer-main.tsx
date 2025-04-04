import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { ProductsBranchTransferHeader } from "./products-branch-transfer-header";
import { ProductsBranchTransferLineItems } from "./products-branch-transfer-line-items";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../app/store/store";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { Messages } from "../../../../../utils/messages";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import _ from "lodash";
import { setActiveTabIndex } from "../../../../../controls/redux-components/comp-slice";
import { XDataObjectType } from "../../../../../utils/global-types-interfaces-enums";
import { DatabaseTablesMap } from "../../../../../app/graphql/maps/database-tables-map";
import { ProductLineItem, TranHeaderType } from "../../shared-types";

export function ProductsBranchTransferMain({ instance }: { instance: string }) {
  const {
    branchId,
    buCode,
    context,
    dbName,
    decodedDbParamsObject,
    finYearId
  } = useUtilsInfo();
  const dispatch: AppDispatchType = useDispatch();

  const selectedTranHeaderId = useSelector(
    (state: RootStateType) => state.reduxComp.compTabs[instance]?.id
  );

  const methods = useForm<BranchTransferType>({
    mode: "onTouched",
    criteriaMode: "all",
    defaultValues: {
      autoRefNo: "",
      tranDate: format(new Date(), "yyyy-MM-dd"),
      userRefNo: null,
      remarks: null,
      destBranchId: null,
      productLineItems: [
        {
          productCode: null,
          productDetails: null,
          lineRefNo: null,
          qty: 1,
          price: 0,
          lineRemarks: null,
          serialNumbers: null
        }
      ]
    }
  });
  const { reset } = methods;

  const extendedMethods = { ...methods, xReset };
  useEffect(() => {
    if (selectedTranHeaderId) {
      loadProductOnTranHeaderId();
    }
  }, [selectedTranHeaderId]);

  useEffect(() => {
    return () => {
      // Reset only selectedTranHeaderId without affecting activeTabIndex
      dispatch(
        setActiveTabIndex({
          instance: instance,
          id: undefined, // Reset the id
          activeTabIndex:
            Utils.getReduxState().reduxComp.compTabs[instance]?.activeTabIndex // Preserve the current activeTabIndex
        })
      );
    };
  }, [dispatch, instance]);

  return (
    <div className="h-[calc(100vh-240px)]">
      <FormProvider {...extendedMethods}>
        <form
          className="flex flex-col gap-6 mr-6 min-w-[85rem]"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <ProductsBranchTransferHeader />
          <ProductsBranchTransferLineItems instance={instance} />
        </form>
      </FormProvider>
    </div>
  );

  async function loadProductOnTranHeaderId() {
    const res: any = await Utils.doGenericQuery({
      buCode: buCode || "",
      dbName: dbName || "",
      dbParams: decodedDbParamsObject || {},
      instance: instance,
      sqlArgs: {
        id: selectedTranHeaderId
      },
      sqlId: SqlIdsMap.getBranchTransferDetailsOnTranHeaderId
    });
    const jsonResult: BranchTransferJsonResultType = res?.[0]?.jsonResult;
    if (_.isEmpty(jsonResult)) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }
    populateData(jsonResult);
  }

  async function onSubmit(data: BranchTransferType) {
    const xData: XDataObjectType = getTranHeaderRow();
    try {
      await Utils.doGenericUpdate({
        buCode: buCode || "",
        tableName: DatabaseTablesMap.TranH,
        xData: xData
      });
      Utils.showSaveMessage();
      xReset();
      if (selectedTranHeaderId) {
        dispatch(setActiveTabIndex({ activeTabIndex: 1, instance: instance }));
      }
    } catch (e) {
      console.log(e);
    }

    function getTranHeaderRow() {
      return {
        id: (data.id as number) || undefined,
        autoRefNo: data.autoRefNo,
        branchId: branchId,
        finYearId: finYearId,
        jData: "{}",
        posId: 1,
        remarks: data.remarks,
        tranDate: data.tranDate,
        tranTypeId: 12,
        userRefNo: data.userRefNo,
        xDetails: getXDetails()
      };
    }

    function getXDetails() {
      return {
        tableName: DatabaseTablesMap.BranchTransfer,
        fkeyName: "tranHeaderId",
        deletedIds: context.DataInstances?.[instance]?.deletedIds || [],
        xData: data.productLineItems.map((item: ProductLineItem) => {
          const formattedSerialNumbers = item.serialNumbers
            ? item.serialNumbers
                .split(/[,;]\s*/) // Split by ',' or ';' with or without spaces
                .filter((sn) => sn.trim() !== "") // Remove empty entries
                .join(", ") // Join with ', '
            : null;
          return {
            id: item.id || undefined,
            destBranchId: data.destBranchId,
            jData: formattedSerialNumbers
              ? JSON.stringify({ serialNumbers: formattedSerialNumbers })
              : null,
            lineRefNo: item.lineRefNo,
            lineRemarks: item.lineRemarks,
            price: item.price,
            productId: item.productId,
            qty: item.qty
          };
        })
      };
    }
  }

  function populateData(jsonResult: BranchTransferJsonResultType) {
    const tranH = jsonResult.tranH;
    const branchTransfers = jsonResult.branchTransfers;
    if (
      _.isEmpty(tranH) ||
      _.isEmpty(branchTransfers) ||
      (Array.isArray(branchTransfers) && branchTransfers.length === 0)
    ) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }
    const destBranchId = branchTransfers?.[0]?.destBranchId;

    const productLineItems = branchTransfers.map(
      (branchTransfer: BranchTransferInfoType) => {
        return {
          id: branchTransfer.id,
          lineRefNo: branchTransfer.lineRefNo,
          lineRemarks: branchTransfer.lineRemarks,
          price: branchTransfer.price,
          productCode: branchTransfer.productCode,
          productDetails: `${branchTransfer.brandName} ${
            branchTransfer.catName
          } ${branchTransfer.label} ${branchTransfer.info ?? ""}`,
          productId: branchTransfer.productId,
          qty: branchTransfer.qty,
          serialNumbers: branchTransfer.serialNumbers,
          tranHeaderId: branchTransfer.tranHeaderId,
          upcCode: branchTransfer.upcCode
        };
      }
    );

    reset(
      // Reset the form with the new data should be done all together
      {
        id: tranH.id,
        autoRefNo: tranH.autoRefNo,
        destBranchId: destBranchId,
        remarks: tranH.remarks,
        tranDate: tranH.tranDate,
        userRefNo: tranH.userRefNo,
        productLineItems: productLineItems
      },
      { keepDirty: false } // Ensure the form is not marked as dirty
    );
  }

  function xReset() {
    reset({
      id: undefined,
      autoRefNo: "",
      tranDate: format(new Date(), "yyyy-MM-dd"),
      userRefNo: null,
      remarks: null,
      destBranchId: null,
      productLineItems: [
        {
          id: undefined,
          productId: undefined,
          productCode: null,
          productDetails: null,
          lineRefNo: null,
          qty: 1,
          price: 0,
          lineRemarks: null,
          tranHeaderId: undefined,
          serialNumbers: null,
          upcCode: null
        }
      ]
    });
    if (context.DataInstances?.[instance]) {
      context.DataInstances[instance].deletedIds = [];
    }
  }
}

export type BranchTransferType = {
  id?: string | number;
  autoRefNo?: string | null;
  destBranchId: number | null;
  productLineItems: ProductLineItem[];
  remarks?: string | null;
  tranDate: string;
  userRefNo?: string | null;
};

export type BranchTransferJsonResultType = {
  branchTransfers: BranchTransferInfoType[];
  tranH: TranHeaderType;
};

type BranchTransferInfoType = {
  brandName: string | null;
  catName: string | null;
  destBranchId: number;
  id: number;
  info: string | null;
  label: string | null;
  lineRefNo: string | null;
  lineRemarks: string | null;
  price: number;
  productCode: string | null;
  productDetails?: string | null;
  productId: number;
  qty: number;
  serialNumbers: string | null;
  tranHeaderId: number;
  upcCode: string | null;
};

// type TranHeaderType = {
//   autoRefNo: string | null;
//   branchId: number;
//   finYearId: number;
//   id?: number;
//   posId?: number;
//   remarks: string | null;
//   tranDate: string;
//   tranTypeId: number;
//   userRefNo: string | null;
//   [key: string]: any;
// };
