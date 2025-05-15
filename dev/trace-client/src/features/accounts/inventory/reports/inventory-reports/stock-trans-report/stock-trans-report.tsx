import { useEffect, useState } from "react";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { shallowEqual, useSelector } from "react-redux";
import { selectCompSwitchStateFn } from "../../../../../../controls/redux-components/comp-slice";
import { RootStateType } from "../../../../../../app/store/store";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";

export function StockTransReport() {

  const instance = DataInstancesMap.stockTransReport;
  const isAllBranches: boolean =
    useSelector(
      (state: RootStateType) => selectCompSwitchStateFn(state, instance),
      shallowEqual
    ) || false;
  const selectedFilters = useSelector(
    (state: RootStateType) => state.stockTransReport
  );

  const [rowsData, setRowsData] = useState<RowDataType[]>([]);
  const {
    branchId,
    buCode,
    currentDateFormat,
    dbName,
    decodedDbParamsObject,
    finYearId,
  } = useUtilsInfo();

  useEffect(() => {
    {
      loadData();
    }
  }, [
    isAllBranches,
    branchId,
    buCode,
    finYearId,
    selectedFilters.catFilterOption.selectedBrand.id,
    selectedFilters.catFilterOption.selectedCategory.id,
    selectedFilters.catFilterOption.selectedTag.id,
    selectedFilters.ageFilterOption.selectedAge.value,
    selectedFilters.onDate,
    // selectedFilters.selectedGrossProfitStatus.value
  ]);

  return <div>Here is the stock transactions report</div>;

  async function loadData() {
      try {
        const state: RootStateType = Utils.getReduxState();
        const isAllBranchesState = state.reduxComp.compSwitch[instance];
        const selectedFiltersState = state.stockTransReport;
  
        const rowsData: RowDataType[] = await Utils.doGenericQuery({
          buCode: buCode || "",
          dbName: dbName || "",
          dbParams: decodedDbParamsObject,
          instance: instance,
          sqlId: SqlIdsMap.getStockTransReport,
          sqlArgs: {
            branchId: isAllBranchesState
              ? null
              : state.login.currentBranch?.branchId,
            finYearId: finYearId,
            brandId:
              selectedFiltersState.catFilterOption.selectedBrand?.id || null,
            catId:
              selectedFiltersState.catFilterOption.selectedCategory?.id || null,
            tagId: selectedFiltersState.catFilterOption.selectedTag?.id || null,
            productCode: null,
            onDate: selectedFiltersState.onDate,
            days: selectedFiltersState.ageFilterOption.selectedAge?.value || 0,
            // grossProfitFilter: selectedFiltersState.selectedGrossProfitStatus.value
          },
        });
  
        setRowsData(rowsData);
      } catch (e: any) {
        console.log(e);
      }
    }
}

type RowDataType = {
  age: number;
  brandName: string;
  catName: string;
  cr: number;
  clos: number;
  dr: number;
  grossProfit: number;
  info: string;
  label: string;
  lastPurchaseDate: string;
  lastPurchasePrice: number;
  op: number;
  price: number;
  productCode: string;
  productId: number;
  qty: number;
  stock: number;
};