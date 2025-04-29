import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import _ from "lodash";
import {
  AppDispatchType,
  RootStateType
} from "../../../../../../app/store/store";
import {
  //   setSalesReportFilterMode,
  setSalesReportFilters
} from "./sales-report-slice";
import { Utils } from "../../../../../../utils/utils";
import { useEffect, useRef, useState } from "react";
import {
  DropDownTreeComponent,
  FieldsModel
} from "@syncfusion/ej2-react-dropdowns";
import { BrandType, CategoryNodeType, TagType } from "../../../shared-types";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
export function SalesReportFilterControl() {
  const dispatch: AppDispatchType = useDispatch();
  const selectedFilters = useSelector(
    (state: RootStateType) => state.salesReport
  );
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
  const catRef = useRef<DropDownTreeComponent | null>(null);
  const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
  const [tagOptions, setTagOptions] = useState<TagType[]>([]);
  const [catOptions, setCatOptions] = useState<CategoryNodeType[]>([]);

  const [filterMode, setFilterMode] = useState(
    selectedFilters.filterMode || "category"
  );
  const fields: FieldsModel = {
    dataSource: catOptions as any,
    value: "id",
    parentValue: "parentId",
    text: "catName",
    hasChildren: "hasChild"
  };

  useEffect(() => {
    if (
      _.isEmpty(brandOptions) &&
      _.isEmpty(tagOptions) &&
      _.isEmpty(catOptions)
    ) {
      loadAllOptions();
    }
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Radio Group for Filter Mode */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-lg font-semibold text-blue-500">
            Group 1: Filter Mode
          </label>
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={isApplyFilterButtonDisabled()}
            className="px-4 py-2 rounded-md text-white text-sm font-medium transition bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply Filters
          </button>
        </div>
        <div className="flex space-x-4">
          {/* Radio buttons */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="filterMode"
              value="category"
              checked={filterMode === "category"}
              onChange={() => setFilterMode("category")}
            />
            <span>By Category / Brand / Tag</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="filterMode"
              value="productCode"
              checked={filterMode === "productCode"}
              onChange={() => setFilterMode("productCode")}
            />
            <span>By Product Code</span>
          </label>
        </div>
      </div>

      {/* Group 1: Category Filters */}
      {filterMode === "category" && (
        <div className="space-y-4">
          {/* <div className="flex items-center justify-between -mt-2">
            <label className="text-lg font-semibold text-blue-500">
              Category Filter
            </label>
          </div> */}

          <DropDownTreeComponent
            id="dropDowntree"
            ref={catRef}
            showClearButton={false}
            placeholder="Select a category ..."
            fields={fields}
            allowMultiSelection={false}
            popupHeight="300px"
            allowFiltering={true}
            filterBarPlaceholder="Search"
            // select={handleOnChangeCategory}
          />
          <Select
            getOptionLabel={(option: BrandType) => option.brandName}
            getOptionValue={(option: BrandType) => option.id as any}
            options={brandOptions}
            styles={Utils.getReactSelectStyles()}
            // value={selectedBrandOption}
            // onChange={handleOnChangeBrand}
            placeholder="Select a brand..."
          />
          <Select
            getOptionLabel={(option: TagType) => option.tagName}
            getOptionValue={(option: TagType) => option.id as any}
            options={tagOptions}
            styles={Utils.getReactSelectStyles()}
            // value={selectedTagOption}
            // onChange={handleOnChangeTag}
            placeholder="Select a tag..."
          />
        </div>
      )}

      {/* Group 1: Product Code */}
      {filterMode === "productCode" && (
        <div className="-mt-2">
          <label className="text-lg font-semibold text-blue-500">
            Product Code
          </label>
          <input
            type="number"
            placeholder="Enter Product Code"
            className="w-full border rounded p-2 mt-2"
            // disabled={filterMode !== "productCode"}
            // value={productCode}
            // onChange={(e) => setProductCode(e.target.value)}
          />
        </div>
      )}

      {/* Group 2: Age */}
      <div className="space-y-2">
        <label className="text-lg font-semibold text-blue-500">
          Group 2: Age{" "}
        </label>
        <Select
          options={ageOptions}
          placeholder="Select Age Range"
          className="mt-2"
          styles={Utils.getReactSelectStyles()}
        />
      </div>

      {/* Group 4: Date Range */}
      <div className="space-y-2">
        <label className="text-lg font-semibold text-blue-500">
          Group 3: Date Range
        </label>
        <Select
          options={dateRangeOptions}
          menuPlacement="top"
          placeholder="Select Date Range"
          className="mt-2"
          styles={Utils.getReactSelectStyles()}
        />
        <div className="flex space-x-2">
          <input
            type="date"
            className="flex-1 border rounded p-2"
            aria-label="start-date"
          />
          <input
            type="date"
            className="flex-1 border rounded p-2"
            aria-label="end-date"
          />
        </div>
      </div>
    </div>
  );

  function handleApplyFilters() {
    dispatch(
      setSalesReportFilters({
        filterMode: filterMode,
        catFilterOption: {
          selectedBrand: null,
          selectedCategory: null,
          selectedTag: null
        },
        productCode: null,
        ageFilterOption: { selectedAge: null },
        dateRangeFilterOption: {
          selectedDateRange: null,
          startDate: null,
          endDate: null
        }
      })
    );
  }

  function isApplyFilterButtonDisabled() {
    return false;
  }

  async function loadAllOptions() {
    try {
      const res = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        sqlId: SqlIdsMap.getBrandsCategoriesTags
      });
      const jsonResult: JsonResultType = res?.[0]?.jsonResult;
      if (jsonResult) {
        const brands = jsonResult.brands || [];
        brands.unshift({ brandName: "All brands", id: null });
        setBrandOptions(brands);

        const tags = jsonResult.tags || [];
        tags.unshift({ tagName: "All tags", id: null });
        setTagOptions(tags);

        const cats = jsonResult.categories || [];
        cats.unshift({
          catName: "All categories",
          id: "",
          isLeaf: true,
          parentId: null
        });
        cats.forEach((cat: CategoryNodeType) => {
          cat.hasChild = !cat.isLeaf;
        });
        setCatOptions(cats);
      }
    } catch (e: any) {
      console.log(e);
    }
  }
}

type JsonResultType = {
  brands: BrandType[];
  categories: CategoryNodeType[];
  tags: TagType[];
};

const ageOptions = [
  { label: "All", value: "all" },
  { label: "0-30 Days", value: "0-30" },
  { label: "31-60 Days", value: "31-60" },
  { label: "61-90 Days", value: "61-90" }
];

const dateRangeOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Custom", value: "custom" }
];
