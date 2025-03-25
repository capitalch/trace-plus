import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { ProductsBrancheTransferHeader } from "./products-branch-transfer-header";
import { ProductLineItems } from "./products-branch-transfer-line-items";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../app/store/store";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { Messages } from "../../../../../utils/messages";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import _ from "lodash";
import { setActiveTabIndex } from "../../../../../controls/redux-components/comp-slice";

export function ProductsBranchTransferMain({ instance }: { instance: string }) {
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
  const dispatch: AppDispatchType = useDispatch();
  const selectedTranHeaderId = useSelector(
    (state: RootStateType) => state.reduxComp.compTabs[instance]?.id
  );

  const methods = useForm<BranchTransferType>({
    mode: "onTouched",
    criteriaMode: "all",
    defaultValues: {
      tranDate: format(new Date(), "yyyy-MM-dd"),
      userRefNo: undefined,
      remarks: undefined,
      destBranchId: undefined,
      productLineItems: [
        {
          productCode: undefined,
          productDetails: undefined,
          lineRefNo: undefined,
          qty: 1,
          price: 0,
          lineRemarks: undefined,
          serialNumbers: ""
        }
      ]
    }
  });
  const { setValue } = methods;

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
      <FormProvider {...methods}>
        <form
          className="flex flex-col gap-6 mr-6 min-w-[85rem]"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <ProductsBrancheTransferHeader />
          <ProductLineItems />
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
    const jsonResult: JsonResultType = res?.[0]?.jsonResult;
    if (_.isEmpty(jsonResult)) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }
    populateData(jsonResult);
  }

  async function onSubmit(data: BranchTransferType) {
    console.log(data);
  }

  function populateData(jsonResult: JsonResultType) {
    const tranH = jsonResult.tranH;
    const branchTransfers = jsonResult.branchTransfer;
    if (
      _.isEmpty(tranH) ||
      _.isEmpty(branchTransfers) ||
      (Array.isArray(branchTransfers) && branchTransfers.length === 0)
    ) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }
    const destBranchId = branchTransfers?.[0]?.destBranchId;
    setValue("autoRefNo", tranH.autoRefNo);
    setValue("destBranchId", destBranchId);
    setValue("remarks", tranH.remarks);
    setValue("tranDate", tranH.tranDate);
    setValue("userRefNo", tranH.userRefNo);
    setValue("id", tranH.id);
    const productLineItems = branchTransfers.map(
      (branchTransfer: BranchTransfersType) => {
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
    setValue("productLineItems", productLineItems);
  }
}

export type BranchTransferType = {
  id?: string | number;
  autoRefNo?: string;
  destBranchId?: number;
  productLineItems: ProductLineItem[];
  remarks?: string;
  tranDate: string;
  userRefNo?: string;
};

type ProductLineItem = {
  id?: number | string;
  amount?: number;
  jData?: { [key: string]: any };
  lineRefNo?: string;
  lineRemarks?: string;
  price: number;
  productCode?: string;
  productDetails?: string;
  productId?: number;
  qty: number;
  serialNumbers: string;
  tranHeaderId?: number;
  upcCode?: string;
};

type BranchTransfersType = {
  brandName: string;
  catName: string;
  destBranchId: number;
  id: number;
  info: string;
  label: string;
  lineRefNo: string;
  lineRemarks: string;
  price: number;
  productCode: string;
  productId: number;
  qty: number;
  serialNumbers: string;
  tranHeaderId: number;
  upcCode: string;
};

type JsonResultType = {
  branchTransfer: BranchTransfersType[];
  tranH: TranHeaderType;
};

type TranHeaderType = {
  autoRefNo: string;
  id: number;
  remarks: string;
  tranDate: string;
  tranTypeId: number;
  userRefNo: string;
};
