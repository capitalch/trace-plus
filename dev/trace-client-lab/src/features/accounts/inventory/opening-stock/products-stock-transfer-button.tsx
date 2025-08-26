import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function ProductsStockTransfer({ instance }: { instance: string }) {
  const {
    branchId,
    buCode,
    dbName,
    decodedDbParamsObject,
    finYearId,
    currentFinYear
  } = useUtilsInfo();
  return (
    <button
      onClick={handleOnClick}
      type="button"
      aria-label="stock transfer"
      className="mr-6 h-8 px-4 py-1 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
    >
      Stock transfer to next year
    </button>
  );

  async function handleOnClick() {
    try {
      await Utils.doGenericUpdateQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.executeStockTransfer,
        sqlArgs: {
          branchId: branchId,
          finYearId: finYearId,
          closingDate: currentFinYear?.endDate
        }
      });
      Utils.showSaveMessage();
    } catch (e) {
      console.log(e);
    }
  }
}
