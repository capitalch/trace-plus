import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import _ from "lodash";
import {
    AppDispatchType,
    RootStateType
} from "../../../../../../app/store/store";
import {
    SalesReportPayloadActionType,
    setSalesReportFilters,
    setSalesReportIsPaneOpen
} from "./sales-report-slice";
import { Utils } from "../../../../../../utils/utils";
import { useEffect, useRef, useState } from "react";
import {
    DdtSelectEventArgs,
    DropDownTreeComponent,
    FieldsModel
} from "@syncfusion/ej2-react-dropdowns";
import { ageOptions, BrandType, CategoryNodeType, dateRangeOptions, DateRangeType, TagType } from "../../../shared-definitions";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import { useInventoryReportsShared } from "../inventory-reports-shared-hook";
import { format } from "date-fns";
export function SalesReportFilterControl() {
    const dispatch: AppDispatchType = useDispatch();
    const [, setRefresh] = useState({});
    const { getDateRange, getMonthRange } = useInventoryReportsShared()
    // const isoFormat = 'yyyy-MM-dd'
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
            selectedBrand: selectedFilters.catFilterOption.selectedBrand,
            selectedCategory: selectedFilters.catFilterOption.selectedCategory,
            selectedTag: selectedFilters.catFilterOption.selectedTag
        },
        productCode: selectedFilters.productCode,
        ageFilterOption: { selectedAge: selectedFilters.ageFilterOption.selectedAge },
        dateRangeFilterOption: {
            selectedDateRange: selectedFilters.dateRangeFilterOption.selectedDateRange,
            startDate: selectedFilters.dateRangeFilterOption.startDate,
            endDate: selectedFilters.dateRangeFilterOption.endDate
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
            return
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
        if (_.isEmpty(pre.dateRangeFilterOption.selectedDateRange)) {
            pre.dateRangeFilterOption.selectedDateRange = dateRangeOptions[0];
            setDateRange(dateRangeOptions[0]);
        }
        setRefresh({}); // Trigger a re-render
    }, [brandOptions, tagOptions]);

    setCategory();

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
                        onClick={handleResetFilters}
                        className="px-4 py-2 rounded-md text-white text-sm font-medium transition bg-amber-600 hover:bg-amber-800"
                    >
                        Reset Filters
                    </button>
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
                            }}
                            className="cursor-pointer"
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
                            }}
                            className="cursor-pointer"
                        />
                        <span className="text-sm font-medium text-primary-500">By Product Code</span>
                    </label>
                    {/* <button type="button" onClick={() => {
                        console.log("Test Button Clicked");
                        console.log(pre);
                        isApplyFilterButtonDisabled();
                    }}>Test</button> */}
                </div>
            </div>

            <div className="h-56">
                {/* Group 1: Category Filters */}
                {pre.filterMode === "category" && (
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-400">
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
                            select={handleOnChangeCategory}
                            created={() => {
                                if (catRef.current) {
                                    setCategory()
                                }
                            }}
                        />

                        <label className="text-sm font-semibold text-gray-400">
                            Brands
                        </label>
                        <Select
                            getOptionLabel={(option: BrandType) => option.brandName}
                            getOptionValue={(option: BrandType) => option.id as any}
                            options={brandOptions}
                            styles={Utils.getReactSelectStyles()}
                            value={pre.catFilterOption.selectedBrand}
                            onChange={handleOnChangeBrand}
                            placeholder="Select a brand..."
                        />

                        <label className="text-sm font-semibold text-gray-400">
                            Tags
                        </label>
                        <Select
                            getOptionLabel={(option: TagType) => option.tagName}
                            getOptionValue={(option: TagType) => option.id as any}
                            options={tagOptions}
                            styles={Utils.getReactSelectStyles()}
                            value={pre.catFilterOption.selectedTag}
                            onChange={handleOnChangeTag}
                            placeholder="Select a tag..."
                        />
                    </div>
                )}

                {/* Group 1: Product Code */}
                {pre.filterMode === "productCode" && (
                    <div className=" flex flex-col">
                        <label className="text-sm font-semibold text-gray-400">
                            Product Code
                        </label>
                        <NumericFormat
                            className="border-spacing-1 border-gray-300 h-10 rounded-md border-2 bg-white"
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

            </div>

            {/* Group 2: Age */}
            <div className="space-y-2">
                <label className="text-lg font-semibold text-blue-500">
                    Group 2: Filter by Product Age{" "}
                </label>
                <Select
                    options={ageOptions}
                    value={pre.ageFilterOption.selectedAge}
                    onChange={handleOnChangeAge}
                    placeholder="Select Age Range"
                    className="mt-2"
                    styles={Utils.getReactSelectStyles()}
                />
            </div>

            {/* Group 4: Date Range */}
            <div className="space-y-2">
                <label className="text-lg font-semibold text-blue-500">
                    Group 3: Filter by Date Range
                </label>
                <Select
                    options={dateRangeOptions}
                    menuPlacement="top"
                    placeholder="Select Date Range"
                    className="mt-2"
                    onChange={handleOnChangeDateRange}
                    styles={Utils.getReactSelectStyles()}
                    value={dateRangeOptions.find((option: DateRangeType) => option.value === pre.dateRangeFilterOption.selectedDateRange?.value) || null}
                />
                <div className="flex space-x-4 mt-4">
                    <input
                        type="date"
                        className="flex-1 border rounded p-2"
                        aria-label="start-date"
                        value={pre.dateRangeFilterOption.startDate || ''}
                        onChange={(e) => {
                            pre.dateRangeFilterOption.startDate = e.target.value;
                            setRefresh({});
                        }}
                    />
                    <input
                        type="date"
                        className="flex-1 border rounded p-2"
                        aria-label="end-date"
                        value={pre.dateRangeFilterOption.endDate || ''}
                        onChange={(e) => {
                            pre.dateRangeFilterOption.endDate = e.target.value;
                            setRefresh({});
                        }}
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
                    selectedBrand: pre.catFilterOption.selectedBrand,
                    selectedCategory: pre.catFilterOption.selectedCategory,
                    selectedTag: pre.catFilterOption.selectedTag
                },
                productCode: pre.productCode,
                ageFilterOption: { selectedAge: pre.ageFilterOption.selectedAge },
                dateRangeFilterOption: {
                    selectedDateRange: pre.dateRangeFilterOption.selectedDateRange,
                    startDate: pre.dateRangeFilterOption.startDate,
                    endDate: pre.dateRangeFilterOption.endDate
                }
            })
        );
        dispatch(setSalesReportIsPaneOpen(false));
    }

    function handleOnChangeAge(selected: any) {
        pre.ageFilterOption.selectedAge = selected;
        setRefresh({});
    }

    function handleOnChangeBrand(selected: BrandType | null) {
        pre.catFilterOption.selectedBrand = selected || brandOptions[0];
        pre.catFilterOption.selectedTag = tagOptions[0];
        pre.catFilterOption.selectedCategory = { catName: 'All', id: '' }
        setRefresh({});
    }

    function handleOnChangeDateRange(selected: any) {
        if (!selected) return
        pre.dateRangeFilterOption.selectedDateRange = selected;
        setDateRange(selected);
        setRefresh({});
    }

    function setDateRange(selected: any) {
        let dateRange: { startDate: string, endDate: string }
        if (Utils.isNumeric(selected.value)) {
            dateRange = getMonthRange(selected.value)
        } else {
            dateRange = getDateRange(selected.value)
        }
        pre.dateRangeFilterOption.startDate = dateRange.startDate
        pre.dateRangeFilterOption.endDate = dateRange.endDate
    }

    function handleOnChangeTag(selected: TagType | null) {
        pre.catFilterOption.selectedBrand = brandOptions[0];
        pre.catFilterOption.selectedTag = selected || tagOptions[0];
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

    function handleOnFocusProductCode(event: any) {
        event.target.select();
    }

    function handleResetFilters() {
        pre.filterMode = "category";
        pre.productCode = null;
        pre.catFilterOption.selectedBrand = brandOptions[0];
        pre.catFilterOption.selectedTag = tagOptions[0];
        pre.catFilterOption.selectedCategory = { catName: "All", id: '' }
        pre.ageFilterOption.selectedAge = ageOptions[0];
        pre.dateRangeFilterOption.selectedDateRange = dateRangeOptions[0];
        setDateRange(dateRangeOptions[0]);
        setRefresh({});
        handleApplyFilters();
    }

    function isApplyFilterButtonDisabled() {

        const isProductCodeFilter = pre.productCode !== null;
        const isAgeFilter = Boolean(pre.ageFilterOption.selectedAge?.value)
        const isCategoryFilterBrand = Boolean(pre.catFilterOption.selectedBrand?.id)
        const isCategoryFilterTag = Boolean(pre.catFilterOption.selectedTag?.id)
        const isCategoryFilterCategory = Boolean(pre.catFilterOption.selectedCategory?.id)
        const isDateRangeFilterStartDate = Boolean(pre.dateRangeFilterOption.startDate !== format(new Date(), 'yyyy-MM-dd'))
        const isDateRangeFilterEndDate = Boolean(pre.dateRangeFilterOption.endDate !== format(new Date(), 'yyyy-MM-dd'))

        const ret: boolean = isProductCodeFilter || isAgeFilter || isCategoryFilterBrand || isCategoryFilterTag || isCategoryFilterCategory || isDateRangeFilterStartDate || isDateRangeFilterEndDate
        return (!ret);
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

type MetaType = SalesReportPayloadActionType

