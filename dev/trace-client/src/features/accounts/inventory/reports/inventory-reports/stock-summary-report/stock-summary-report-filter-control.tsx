import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  AppDispatchType,
  RootStateType,
} from "../../../../../../app/store/store";
import {
  ageOptions,
  BrandType,
  CategoryNodeType,
  TagType,
} from "../../../shared-definitions";
import { StockSummaryReportPayloadActionType } from "./stock-summary-report-slice";
import { useEffect, useRef, useState } from "react";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import {
  DropDownTreeComponent,
  FieldsModel,
} from "@syncfusion/ej2-react-dropdowns";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../../../utils/utils";

export function StockSummaryReportFilterControl() {
  const dispatch: AppDispatchType = useDispatch();
  const [, setRefresh] = useState({});
  const selectedFilters = useSelector(
    (state: RootStateType) => state.stockSummaryReport
  );
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
  const catRef = useRef<DropDownTreeComponent | null>(null);
  const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
  const [tagOptions, setTagOptions] = useState<TagType[]>([]);
  const [catOptions, setCatOptions] = useState<CategoryNodeType[]>([]);

  const meta = useRef<MetaType>({
    catFilterOption: {
      selectedBrand: selectedFilters.catFilterOption.selectedBrand,
      selectedCategory: selectedFilters.catFilterOption.selectedCategory,
      selectedTag: selectedFilters.catFilterOption.selectedTag,
    },
    productCode: selectedFilters.productCode,
    ageFilterOption: {
      selectedAge: selectedFilters.ageFilterOption.selectedAge,
    },
    onDate: selectedFilters.onDate,
    selectedGrossProfitStatus: selectedFilters.selectedGrossProfitStatus,
  });
  const pre = meta.current;

  const fields: FieldsModel = {
    dataSource: catOptions as any,
    value: "id",
    parentValue: "parentId",
    text: "catName",
    hasChildren: "hasChild",
  };

  useEffect(() => {
    if (
      _.isEmpty(brandOptions) &&
      _.isEmpty(tagOptions) &&
      _.isEmpty(catOptions)
    ) {
      loadAllOptions();
      return;
    }
    if (_.isEmpty(pre.catFilterOption.selectedBrand)) {
      pre.catFilterOption.selectedBrand = brandOptions[0];
    }
    if (_.isEmpty(pre.catFilterOption.selectedTag)) {
      pre.catFilterOption.selectedTag = tagOptions[0];
    }
    if (_.isEmpty(pre.ageFilterOption.selectedAge)) {
      pre.ageFilterOption.selectedAge = ageOptions[0];
    }

    setRefresh({}); // Trigger a re-render
  }, [brandOptions, tagOptions]);

  setCategory();

  return (
    <div className="p-4 space-y-4 bg-white rounded shadow-sm">
      <div className="flex flex-wrap gap-4">

        {/* On Date */}
        <label className="flex flex-col text-sm font-semibold text-gray-600 w-40">
          On Date
          <input
            type="date"
            className="mt-1 border rounded px-2 py-2 text-sm"
            aria-label="start-date"
            value={pre.onDate || ""}
            onChange={(e) => {
              pre.onDate = e.target.value;
              setRefresh({});
            }}
          />
        </label>

        {/* Age */}
        <label className="flex flex-col text-sm font-semibold text-gray-600">
          Age
          <Select
            options={ageOptions}
            value={pre.ageFilterOption.selectedAge}
            placeholder="Select Age Range"
            className="mt-1 w-40"
            styles={Utils.getReactSelectStyles()}
          />
        </label>

        {/* Gross Profit */}
        <label className="flex flex-col text-sm font-semibold text-gray-600">
          Gross Profit
          <Select
            options={ageOptions}
            value={pre.ageFilterOption.selectedAge}
            placeholder="Select Gross Profit"
            className="mt-1 w-36"
            styles={Utils.getReactSelectStyles()}
          />
        </label>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-600">
          Categories
        </label>
        <DropDownTreeComponent
          className="h-10"
          id="dropDowntree"
          ref={catRef}
          showClearButton={false}
          placeholder="Select a category ..."
          fields={fields}
          allowMultiSelection={false}
          popupHeight="300px"
          allowFiltering={true}
          filterBarPlaceholder="Search"
          created={() => {
            if (catRef.current) {
              setCategory();
            }
          }}
        />
      </div>

      {/* Brand and Tag Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Brands */}
        <label className="flex flex-col text-sm font-semibold text-gray-600 flex-1 min-w-[200px]">
          Brands
          <Select
            className="mt-1 w-full"
            getOptionLabel={(option: BrandType) => option.brandName}
            getOptionValue={(option: BrandType) => option.id as any}
            options={brandOptions}
            styles={Utils.getReactSelectStyles()}
            value={pre.catFilterOption.selectedBrand}
            placeholder="Select a brand..."
          />
        </label>

        {/* Tags */}
        <label className="flex flex-col text-sm font-semibold text-gray-600 flex-1 min-w-[200px]">
          Tags
          <Select
            className="mt-1 w-full"
            getOptionLabel={(option: TagType) => option.tagName}
            getOptionValue={(option: TagType) => option.id as any}
            options={tagOptions}
            styles={Utils.getReactSelectStyles()}
            value={pre.catFilterOption.selectedTag}
            placeholder="Select a tag..."
          />
        </label>
      </div>
    </div>
  );

  async function loadAllOptions() {
    try {
      const res = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        sqlId: SqlIdsMap.getBrandsCategoriesTags,
      });
      const jsonResult: JsonResultType = res?.[0]?.jsonResult;
      if (jsonResult) {
        const brands = jsonResult.brands || [];
        brands.unshift({ brandName: "All", id: null });
        setBrandOptions(brands);

        const tags = jsonResult.tags || [];
        tags.unshift({ tagName: "All", id: null });
        setTagOptions(tags);

        const cats = jsonResult.categories || [];
        cats.unshift({
          catName: "All",
          id: "",
          isLeaf: true,
          parentId: null,
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

  function setCategory() {
    if (catRef.current) {
      if (_.isEmpty(pre.catFilterOption.selectedCategory)) {
        catRef.current.value = [""];
      } else {
        catRef.current.value = [pre.catFilterOption.selectedCategory.id];
        catRef.current.ensureVisible(pre.catFilterOption.selectedCategory.id);
      }
    }
  }
}

type JsonResultType = {
  brands: BrandType[];
  categories: CategoryNodeType[];
  tags: TagType[];
};

type MetaType = StockSummaryReportPayloadActionType;
