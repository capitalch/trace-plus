import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { ProductsBrancheTransferHeader } from "./products-branch-transfer-header";
import { ProductLineItems } from "./products-branch-transfer-line-items";
import { useEffect, } from "react";
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

export function ProductsBranchTransferMain({ instance }: { instance: string }) {
    const {branchId, buCode, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();
    const dispatch: AppDispatchType = useDispatch();
    const selectedTranHeaderId = useSelector(
        (state: RootStateType) => state.reduxComp.compTabs[instance]?.id
    );

    const methods = useForm<BranchTransferType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            autoRefNo: '',
            tranDate: format(new Date(), "yyyy-MM-dd"),
            userRefNo: '',
            remarks: '',
            destBranchId: undefined,
            productLineItems: [
                {
                    productCode: '',
                    productDetails: '',
                    lineRefNo: '',
                    qty: 1,
                    price: 0,
                    lineRemarks: '',
                    serialNumbers: ""
                }
            ]
        }
    });
    const { reset, } = methods;

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

    function getXData(data: BranchTransferType){
        const xData:XDataObjectType = {
            tableName: DatabaseTablesMap.TranH,
            data:[]
        }
        const dataItem: {
            id?: string | number;
            autoRefNo?: string | null;
            branchId?: number;
            details: {
                id?: number | string;
                destBranchId?: number;
                jData?: { serialNumbers: string };
                lineRefNo?: string;
                lineRemarks?: string;
                price: number;
                productId?: number;
                qty: number;
            }[];
            finYearId?: number;
            jData?: string;
            posId?: number;
            remarks?: string | null;
            tranDate: string;
            tranTypeId: number;
            userRefNo?: string | null;
        } = {
            id: data.id || undefined,
            autoRefNo: data.autoRefNo,
            branchId: branchId,
            details:[],
            finYearId: finYearId,
            jData: '{}',
            posId:1,
            remarks: data.remarks,
            tranDate: data.tranDate,
            tranTypeId: 12,
            userRefNo: data.userRefNo,
        }

        const branchTransfer: any = {
            tableName: DatabaseTablesMap.BranchTransfer,
            fkeyName: 'tranHeaderId',
            deletedIds:[],
            data: getProductLineItems()
        }

        dataItem.details.push(branchTransfer);
        xData.data.push(dataItem);
        return(xData)

        function getProductLineItems(){
            return data.productLineItems.map((item:ProductLineItem) => {
                return {
                    id: item.id || undefined,
                    destBranchId: data.destBranchId,
                    jData: {serialNumbers: item.serialNumbers},
                    lineRefNo: item.lineRefNo,
                    lineRemarks: item.lineRemarks,
                    price: item.price,
                    productId: item.productId,
                    qty: item.qty,
                }
            })
        }
    }

    async function onSubmit(data: BranchTransferType) {
        console.log(data);
        const xData: XDataObjectType = getXData(data);
        console.log(xData);
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

        const productLineItems = branchTransfers.map(
            (branchTransfer: BranchTransfersType) => {
                return {
                    id: branchTransfer.id,
                    lineRefNo: branchTransfer.lineRefNo,
                    lineRemarks: branchTransfer.lineRemarks,
                    price: branchTransfer.price,
                    productCode: branchTransfer.productCode,
                    productDetails: `${branchTransfer.brandName} ${branchTransfer.catName
                        } ${branchTransfer.label} ${branchTransfer.info ?? ""}`,
                    productId: branchTransfer.productId,
                    qty: branchTransfer.qty,
                    serialNumbers: branchTransfer.serialNumbers,
                    tranHeaderId: branchTransfer.tranHeaderId,
                    upcCode: branchTransfer.upcCode
                };
            }
        );

        reset( // Reset the form with the new data should be done all together
            {
                id: tranH.id,
                autoRefNo: tranH.autoRefNo,
                destBranchId: destBranchId,
                remarks: tranH.remarks,
                tranDate: tranH.tranDate,
                userRefNo: tranH.userRefNo,
                productLineItems: productLineItems,
            },
            { keepDirty: false } // Ensure the form is not marked as dirty
        );
    }
}

export type BranchTransferType = {
    id?: string | number;
    autoRefNo?: string | null;
    destBranchId?: number;
    productLineItems: ProductLineItem[];
    remarks?: string | null;
    tranDate: string;
    userRefNo?: string | null;
};

type ProductLineItem = {
    id?: number | string;
    amount?: number;
    jData?: { [key: string]: any };
    lineRefNo?: string | null;
    lineRemarks?: string | null;
    price: number;
    productCode?: string | null;
    productDetails?: string | null;
    productId?: number;
    qty: number;
    serialNumbers: string | null;
    tranHeaderId?: number;
    upcCode?: string | null;
};

type BranchTransfersType = {
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
    productId: number;
    qty: number;
    serialNumbers: string | null;
    tranHeaderId: number;
    upcCode: string | null;
};

type JsonResultType = {
    branchTransfer: BranchTransfersType[];
    tranH: TranHeaderType;
};

type TranHeaderType = {
    autoRefNo: string | null;
    id: number;
    remarks: string | null;
    tranDate: string;
    tranTypeId: number;
    userRefNo: string | null;
};