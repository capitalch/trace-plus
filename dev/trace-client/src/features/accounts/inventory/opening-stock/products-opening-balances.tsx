// import { useDispatch } from "react-redux";
// import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
// import { AppDispatchType } from "../../../../app/store/store";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";
// import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
// import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
// import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
// import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";
// import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";
import { ProductsOpeningBalancesWorkBench } from "./products-opening-balances-workbench";
import { ProductsOpeningBalancesGrid } from "./products-opening-balances-grid";

export function ProductsOpeningBalances() {
    // const instance = DataInstancesMap.productsOpeningBalances;
    // const dispatch: AppDispatchType = useDispatch();
    // const { branchId, buCode, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<CompAccountsContainer>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 h-[calc(100vh-120px)] mr-4 mt-4">
            <div className="sm:col-span-1 bg-gray-50 p-4">
                <ProductsOpeningBalancesWorkBench />
            </div>
            <div className="sm:col-span-3 bg-gray-100 pl-4">
                <ProductsOpeningBalancesGrid />
            </div>
        </div>

    </CompAccountsContainer>)

}