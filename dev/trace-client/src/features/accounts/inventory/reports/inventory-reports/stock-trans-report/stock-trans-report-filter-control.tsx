import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
import { useEffect, useRef, useState } from "react";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { DdtSelectEventArgs, DropDownTreeComponent, FieldsModel } from "@syncfusion/ej2-react-dropdowns";
import { BrandType, CategoryNodeType, TagType } from "../../../shared-definitions";
import { setStockTransReportFilters, StockTransReportInitialStateType } from "./stock-trans-report-slice";
import _ from 'lodash'
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import Select from 'react-select'
import { NumericFormat } from "react-number-format";

export function StockTransReportFilterControl() {
  const dispatch: AppDispatchType = useDispatch();
  const [, setRefresh] = useState({});
  const selectedFilters = useSelector(
    (state: RootStateType) => state.stockTransReport
  );
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
  const catRef = useRef<DropDownTreeComponent | null>(null);
  const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
  const [tagOptions, setTagOptions] = useState<TagType[]>([]);
  const [catOptions, setCatOptions] = useState<CategoryNodeType[]>([]);

  const meta = useRef<MetaType>({
    filterMode: selectedFilters.filterMode,
    catFilterOption: {
      selectedBrand: selectedFilters.catFilterOption.selectedBrand,
      selectedCategory: selectedFilters.catFilterOption.selectedCategory,
      selectedTag: selectedFilters.catFilterOption.selectedTag,
    },
    productCode: selectedFilters.productCode
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
    setRefresh({}); // Trigger a re-render
  }, [brandOptions, tagOptions]);

  setCategory();

  return (<div className="p-4 space-y-6 bg-white rounded shadow-sm h-[415px]">

    {/* Buttons + filter mode toggle */}

    {/*  Reset */}
    <div className="flex justify-between items-center">
      <button
        type="button"
        onClick={handleResetFilters}
        className="px-4 py-2 rounded-md text-white text-sm font-medium bg-amber-600 hover:bg-amber-800 transition"
      >
        Reset Filters
      </button>

      {/* Filter mode toggle */}
      <label className="flex items-center space-x-2 text-sm font-medium text-primary-600 cursor-pointer">
        <input
          type="checkbox"
          checked={pre.filterMode === 'productCode'}
          onChange={(e) => {
            pre.filterMode = e.target.checked ? 'productCode' : 'category';
            if (!e.target.checked) pre.productCode = '';
            setRefresh({});
          }}
          className="h-6 w-6 text-blue-600 border-gray-300 rounded cursor-pointer"
        />
        <span>Filter by Product Code</span>
      </label>

      {/* Apply filters */}
      <button
        type="button"
        onClick={handleApplyFilters}
        disabled={isApplyFilterButtonDisabled()}
        className="px-4 py-2 rounded-md text-white text-sm font-medium transition bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Apply Filters
      </button>
    </div>

    {/* Filter by Category / Brand / Tag */}
    {pre.filterMode === 'category' && (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-600">Categories</label>
          <DropDownTreeComponent
            className="h-10 mt-1"
            id="dropDowntree"
            ref={catRef}
            showClearButton={false}
            placeholder="Select a category ..."
            fields={fields}
            allowMultiSelection={false}
            popupHeight="300px"
            allowFiltering={true}
            filterType="Contains"
            filterBarPlaceholder="Search"
            select={handleOnChangeCategory}
            created={() => {
              if (catRef.current) setCategory();
            }}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col text-sm font-semibold text-gray-600 flex-1 min-w-[200px]">
            Brands
            <Select
              className="mt-1"
              getOptionLabel={(option: BrandType) => option.brandName}
              getOptionValue={(option: BrandType) => option.id as any}
              options={brandOptions}
              styles={Utils.getReactSelectStyles()}
              value={pre.catFilterOption.selectedBrand}
              onChange={handleOnChangeBrand}
              placeholder="Select a brand..."
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-gray-600 flex-1 min-w-[200px]">
            Tags
            <Select
              className="mt-1"
              getOptionLabel={(option: TagType) => option.tagName}
              getOptionValue={(option: TagType) => option.id as any}
              options={tagOptions}
              styles={Utils.getReactSelectStyles()}
              value={pre.catFilterOption.selectedTag}
              onChange={handleOnChangeTag}
              placeholder="Select a tag..."
            />
          </label>
        </div>
      </div>
    )}

    {/* Product Code Input */}
    {pre.filterMode === 'productCode' && (
      <div className="relative w-full max-w-xs">
        <label className="flex flex-col text-sm font-semibold text-gray-600">
          Product Code
          <NumericFormat
            className="mt-1 border border-gray-300 h-10 rounded-md bg-white px-2"
            allowNegative={false}
            autoFocus
            decimalScale={0}
            fixedDecimalScale
            onFocus={(event: any) => event.target.select()}
            placeholder="Enter Product Code"
            value={pre.productCode}
            onValueChange={({ value }) => {
              pre.productCode = value || null;
              setRefresh({});
            }}
          />
        </label>
        {pre.productCode && (
          <button
            type="button"
            className="absolute right-2 top-8 text-gray-400 hover:text-red-500"
            onClick={() => {
              pre.productCode = '';
              setRefresh({});
            }}
          >
            ✕
          </button>
        )}
      </div>
    )}
  </div>)

  function handleApplyFilters() {
    dispatch(
      setStockTransReportFilters({
        filterMode: pre.filterMode,
        catFilterOption: {
          selectedBrand: pre.catFilterOption.selectedBrand,
          selectedCategory: pre.catFilterOption.selectedCategory,
          selectedTag: pre.catFilterOption.selectedTag
        },
        productCode: pre.productCode,
      })
    );
    Utils.showHideModalDialogA({ isOpen: false })
  }

  function handleOnChangeBrand(selected: BrandType | null) {
    pre.catFilterOption.selectedBrand = selected || brandOptions[0];
    pre.catFilterOption.selectedTag = tagOptions[0];
    pre.catFilterOption.selectedCategory = { catName: 'All', id: '' }
    setRefresh({});
  }

  function handleOnChangeCategory(e: DdtSelectEventArgs) {
    const item: any = e.itemData;
    pre.catFilterOption.selectedCategory = {
      id: item.id,
      catName: item.text
    }
    if (e.isInteracted) {
      pre.catFilterOption.selectedTag = tagOptions[0];
      pre.catFilterOption.selectedBrand = brandOptions[0];
      setRefresh({});
    }
  }

  function handleOnChangeTag(selected: TagType | null) {
    pre.catFilterOption.selectedBrand = brandOptions[0];
    pre.catFilterOption.selectedTag = selected || tagOptions[0];
    pre.catFilterOption.selectedCategory = { catName: 'All', id: '' }
    setRefresh({});
  }

  function handleResetFilters() {
    pre.filterMode = "category";
    pre.productCode = null;
    pre.catFilterOption.selectedBrand = brandOptions[0];
    pre.catFilterOption.selectedTag = tagOptions[0];
    pre.catFilterOption.selectedCategory = { catName: "All", id: '' }
    setRefresh({});
    handleApplyFilters();
  }

  function isApplyFilterButtonDisabled() {
    const isProductCodeFilter = pre.productCode !== null;
    const isCategoryFilterBrand = Boolean(pre.catFilterOption.selectedBrand?.id)
    const isCategoryFilterTag = Boolean(pre.catFilterOption.selectedTag?.id)
    const isCategoryFilterCategory = Boolean(pre.catFilterOption.selectedCategory?.id)

    const ret: boolean = isProductCodeFilter || isCategoryFilterBrand || isCategoryFilterTag || isCategoryFilterCategory
    return (!ret);
  }

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

type MetaType = StockTransReportInitialStateType;