import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import _ from "lodash";
import {
    AppDispatchType,
    RootStateType
} from "../../../../../../app/store/store";
import {
    SalesReportPayloadActionType,
    //   setSalesReportFilterMode,
    setSalesReportFilters
} from "./sales-report-slice";
import { Utils } from "../../../../../../utils/utils";
import { useEffect, useRef, useState } from "react";
import {
    DdtSelectEventArgs,
    DropDownTreeComponent,
    FieldsModel
} from "@syncfusion/ej2-react-dropdowns";
import { BrandType, CategoryNodeType, TagType } from "../../../shared-types";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { NumberFormatValues, NumericFormat } from "react-number-format";
export function SalesReportFilterControl() {
    const dispatch: AppDispatchType = useDispatch();
    const [, setRefresh] = useState({});
    const selectedFilters = useSelector(
        (state: RootStateType) => state.salesReport
    );
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const catRef = useRef<DropDownTreeComponent | null>(null);
    const productCodeRef = useRef<any>(null)
    const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
    const [tagOptions, setTagOptions] = useState<TagType[]>([]);
    const [catOptions, setCatOptions] = useState<CategoryNodeType[]>([]);

    const meta = useRef<MetaType>({
        filterMode: selectedFilters.filterMode,
        catFilterOption: {
            selectedBrand: null,
            selectedCategory: selectedFilters.catFilterOption.selectedCategory,
            selectedTag: null
        },
        productCode: selectedFilters.productCode,
        ageFilterOption: { selectedAge: null },
        dateRangeFilterOption: {
            selectedDateRange: null,
            startDate: null,
            endDate: null
        }
    })
    const pre = meta.current;

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
        if (catRef.current) {
            if (_.isEmpty(pre.catFilterOption.selectedCategory)) {
                catRef.current.value = [""];
            } else {
                catRef.current.value = [pre.catFilterOption.selectedCategory.id];
                catRef.current.ensureVisible(pre.catFilterOption.selectedCategory.id);
            }
            setRefresh({});
        }
    }, [pre.catFilterOption.selectedCategory]);

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

                {/* Radio buttons */}
                <div className="flex space-x-4 mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="filterMode"
                            value="category"
                            checked={pre.filterMode === "category"}
                            onChange={() => {
                                pre.filterMode = "category";
                                setRefresh({})
                            }
                            }
                        />
                        <span className="text-sm font-medium text-primary-500">By Category / Brand / Tag</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer ml-2">
                        <input
                            type="radio"
                            name="filterMode"
                            value="productCode"
                            checked={pre.filterMode === "productCode"}
                            onChange={() => {
                                pre.filterMode = "productCode";
                                setRefresh({})
                            }
                            }
                        />
                        <span className="text-sm font-medium text-primary-500">By Product Code</span>
                    </label>
                </div>
            </div>

            {/* Group 1: Category Filters */}
            {pre.filterMode === "category" && (
                <div className="space-y-4">
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
                        select={handleOnChangeCategory}
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
            {pre.filterMode === "productCode" && (
                <div className="-mt-2 flex flex-col">
                    <label className="text-md font-semibold text-primary-500">
                        Product Code
                    </label>
                    <NumericFormat
                        className="border-spacing-1 mt-2 border-gray-300 h-10 rounded-md border-2 bg-white"
                        allowNegative={false}
                        autoFocus={true}
                        decimalScale={0}
                        fixedDecimalScale={true}
                        getInputRef={productCodeRef}
                        onFocus={handleOnFocusProductCode}
                        placeholder="Enter Product Code"
                        value={pre.productCode}
                        onValueChange={(values: NumberFormatValues) => {
                            const { value } = values;
                            pre.productCode = +value;
                            setRefresh({});
                        }}
                    />
                </div>
            )}

            {/* Group 2: Age */}
            <div className="space-y-2">
                <label className="text-lg font-semibold text-blue-500">
                    Group 2: Product Age{" "}
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
                filterMode: pre.filterMode,
                catFilterOption: {
                    selectedBrand: null,
                    selectedCategory: pre.catFilterOption.selectedCategory,
                    selectedTag: null
                },
                productCode: pre.productCode,
                ageFilterOption: { selectedAge: null },
                dateRangeFilterOption: {
                    selectedDateRange: null,
                    startDate: null,
                    endDate: null
                }
            })
        );
    }

    function handleOnChangeCategory(e: DdtSelectEventArgs) {
        const item: any = e.itemData;
        pre.catFilterOption.selectedCategory = {
            id: item.id,
            catName: item.text
        }
        setRefresh({});
        // if (e.isInteracted) {
        //   dispatch(setSelectedTag(tagOptions[0]));
        //   dispatch(setSelectedBrand(brandOptions[0]));
        //   context.CompSyncFusionGrid[instance].loadData();
        //   dispatch(setPurchasePriceVariationIsPaneOpen(false));
        // }
      }

    function handleOnFocusProductCode(event: any) {
        event.target.select();
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

type MetaType = SalesReportPayloadActionType

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
