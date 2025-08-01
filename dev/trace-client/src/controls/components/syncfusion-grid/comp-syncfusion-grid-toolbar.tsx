import { FC, ReactElement, useContext } from "react";
import { CompSyncFusionGridSearchBox } from "./comp-syncfusion-grid-search-box";
import { WidgetButtonRefresh } from "../../widgets/widget-button-refresh";
import { GlobalContext, GlobalContextType } from "../../../app/global-context";
import { AppDispatchType, RootStateType } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { setLastNoOfRows } from "../../../app/graphql/query-helper-slice";
import { IconFilePdf } from "../../icons/icon-file-pdf";
import { IconFileExcel } from "../../icons/icon-file-excel";
import { IconFileCsv } from "../../icons/icon-file-csv";
import { Utils } from "../../../utils/utils";
import { PdfExportProperties } from "@syncfusion/ej2-react-grids";
import clsx from "clsx";
import {TooltipComponent } from "@syncfusion/ej2-react-popups";

export function CompSyncFusionGridToolbar({
  className,
  CustomControl = undefined,
  instance = "",
  isAllBranches,
  isCsvExport = true,
  isExcelExport = true,
  isLastNoOfRows = false,
  isPdfExport = true,
  isPdfExportAsLandscape = false,
  isRefresh = true,
  isSearch = true,
  minWidth = "1200px",
  title,
  setToggleReload,
  subTitleControl = undefined
}: CompSyncFusionGridToolbarType) {
  const context: GlobalContextType = useContext(GlobalContext);
  const dispatch: AppDispatchType = useDispatch();
  const selectedLastNoOfRows: string = useSelector(
    (state: RootStateType) => state.queryHelper[instance]?.lastNoOfRows
  );

  const pdfExportProperties: PdfExportProperties = {
    fileName: `${title}-${Utils.getCompanyName()}-${isAllBranches
      ? "All branches"
      : Utils.getCurrentLoginInfo().currentBranch?.branchName || ""
      }-${Utils.getCurrentFinYearFormattedDateRange()}.pdf`,
    header: {
      fromTop: 0,
      height: 50,
      contents: [
        {
          type: "Text",
          value: `${Utils.getCompanyName()}, Branch: ${isAllBranches
            ? "All branches"
            : Utils.getCurrentLoginInfo().currentBranch?.branchName || ""
            }`,
          position: { x: 0, y: 0 },
          style: { textBrushColor: "#000000", fontSize: 16 }
        },
        {
          type: "Text",
          value: `${title}: (${Utils.getCurrentFinYearFormattedDateRange()})`,
          position: { x: 0, y: 20 },
          style: { textBrushColor: "#000000", fontSize: 14 }
        }
      ]
    },
    pageOrientation: isPdfExportAsLandscape ? "Landscape" : "Portrait"
  };

  return (
    <div
      className={clsx("flex items-center justify-between", className)}
      style={{ minWidth: `${minWidth}` }}
    >
      <div className="flex flex-col gap-1">
        <label className="mt-0 text-lg font-medium text-primary-500 inline-block whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </label>
        {subTitleControl && (
          <div className="text-sm text-gray-500">{subTitleControl}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {CustomControl && <CustomControl />}

        {/* last no of rows */}
        {isLastNoOfRows && (
          <select
            value={selectedLastNoOfRows}
            title="select"
            className="rounded-md h-9 border border-none bg-slate-200 text-sm focus:border-none focus:outline-hidden cursor-pointer"
            onChange={handleOnChangeLastNoOfRows}
          >
            <option value="100">Last 100 rows</option>
            <option value="500">Last 500 rows</option>
            <option value="1000">Last 1000 rows</option>
            <option value="">All rows</option>
          </select>
        )}

        {/* Pdf export  */}
        {isPdfExport && (
          <TooltipComponent content="Pdf export">
            <button
              type="button"
              aria-label="Pdf export"
              className="h-8 w-8 rounded-md bg-yellow-300 hover:bg-yellow-400 mt-1.5"
              onClick={async () => {
                const gridRef: any = await context.CompSyncFusionGrid[instance]
                  .gridRef;
                await gridRef.current.pdfExport(pdfExportProperties);
              }}
            >
              <IconFilePdf className="m-auto h-6 w-6 text-red-600" />
            </button>
          </TooltipComponent>
        )}

        {/* Excel export */}
        {isExcelExport && (
          <TooltipComponent content="Excel export">
            <button
              type="button"
              aria-label="Excel export"
              className="h-8 w-8 rounded-md bg-gray-200 hover:bg-gray-300 mt-1.5"
              onClick={() => {
                const gridRef: any =
                  context.CompSyncFusionGrid[instance].gridRef;
                gridRef.current.excelExport({
                  includeHeader: true,
                  includeFooter: false // This excludes footer aggregates
                });
              }}
            >
              <IconFileExcel className="m-auto h-6 w-6 text-green-600" />
            </button>
          </TooltipComponent>
        )}

        {/* csv export */}
        {isCsvExport && (
          <TooltipComponent content="Csv export">
            <button
              type="button"
              aria-label="Csv export"
              className="h-8 w-8 rounded-md bg-red-100 hover:bg-red-200 mt-1.5"
              onClick={() => {
                const gridRef: any =
                  context.CompSyncFusionGrid[instance].gridRef;
                gridRef.current.csvExport();
              }}
            >
              <IconFileCsv className="m-auto h-6 w-6 text-blue-600" />
            </button>
          </TooltipComponent>
        )}

        {/* Search */}
        {isSearch && <CompSyncFusionGridSearchBox instance={instance} />}

        {/* Refresh */}
        {isRefresh && (
          <TooltipComponent content='Refresh'>
            <WidgetButtonRefresh
              handleRefresh={async () => {
                const loadData: any =
                  context.CompSyncFusionGrid[instance].loadData;

                if (setToggleReload) {
                  setToggleReload((prev: boolean) => !prev)
                } else if (loadData) {
                  await loadData();
                }
                const state: RootStateType = Utils.getReduxState();
                const searchString = state.queryHelper[instance]?.searchString;
                const gridRef: any =
                  context.CompSyncFusionGrid[instance].gridRef;
                if (searchString) {
                  gridRef.current.search(searchString);
                }
              }}
            />
          </TooltipComponent>
        )}
      </div>
    </div>
  );

  function handleOnChangeLastNoOfRows(e: any) {
    dispatch(
      setLastNoOfRows({
        instance: instance,
        lastNoOfRows: e.target.value
      })
    );
  }
}

type CompSyncFusionGridToolbarType = {
  className?: string;
  CustomControl?: FC;
  instance: string;
  isAllBranches?: boolean;
  isCsvExport?: boolean;
  isExcelExport?: boolean;
  isLastNoOfRows?: boolean;
  isPdfExport?: boolean;
  isPdfExportAsLandscape?: boolean;
  isRefresh?: boolean;
  isSearch?: boolean;
  minWidth?: string;
  subTitleControl?: ReactElement;
  title: string;
  setToggleReload?: (value: (val: boolean) => boolean) => void;
};
