import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
import { useEffect, useRef, useState } from "react";
import { useInventoryReportsShared } from "../inventory-reports-shared-hook";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { DdtSelectEventArgs, DropDownTreeComponent, FieldsModel } from "@syncfusion/ej2-react-dropdowns";
import { ageOptions, BrandType, CategoryNodeType, dateRangeOptions, DateRangeType, TagType } from "../../../shared-definitions";
import { SalesReportPayloadActionType, setSalesReportFilters } from "./sales-report-slice";
import _ from 'lodash'
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { format } from "date-fns";
import Select from 'react-select'
import { NumericFormat } from "react-number-format";

export function SalesReportFilterControl() {
    const dispatch: AppDispatchType = useDispatch();
    const [, setRefresh] = useState({});
    const { getDateRange, getMonthRange } = useInventoryReportsShared()
    const selectedFilters = useSelector(
        (state: RootStateType) => state.salesReport
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

        <div className="p-4 space-y-6 bg-white rounded shadow-sm h-[415px]">

            {/* Buttons */}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-md text-white text-sm font-medium bg-amber-600 hover:bg-amber-800 transition"
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

            {/* Date Filters */}
            <div className="flex flex-wrap gap-4">
                <label className="flex flex-col text-sm font-semibold text-gray-600 w-44">
                    Date Range
                    <Select
                        options={dateRangeOptions}
                        menuPlacement="top"
                        placeholder="Select Date Range"
                        className="mt-1"
                        onChange={handleOnChangeDateRange}
                        styles={Utils.getReactSelectStyles()}
                        value={
                            dateRangeOptions.find(
                                (option: DateRangeType) => option.value === pre.dateRangeFilterOption.selectedDateRange?.value
                            ) || null
                        }
                    />
                </label>

                <label className="flex flex-col text-sm font-semibold text-gray-600 w-36">
                    Start Date
                    <input
                        type="date"
                        className="mt-1 border rounded px-2 py-2 text-sm"
                        max={format(new Date(), 'yyyy-MM-dd')}
                        value={pre.dateRangeFilterOption.startDate || ''}
                        onChange={(e) => {
                            pre.dateRangeFilterOption.startDate = e.target.value;
                            setRefresh({});
                        }}
                    />
                </label>

                <label className="flex flex-col text-sm font-semibold text-gray-600 w-36">
                    End Date
                    <input
                        type="date"
                        className="mt-1 border rounded px-2 py-2 text-sm"
                        max={format(new Date(), 'yyyy-MM-dd')}
                        value={pre.dateRangeFilterOption.endDate || ''}
                        onChange={(e) => {
                            pre.dateRangeFilterOption.endDate = e.target.value;
                            setRefresh({});
                        }}
                    />
                </label>
            </div>

            {/* Age + Filter Mode Toggle */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <label className="flex flex-col text-sm font-semibold text-gray-600 w-36">
                    Age
                    <Select
                        options={ageOptions}
                        value={pre.ageFilterOption.selectedAge}
                        onChange={handleOnChangeAge}
                        placeholder="Select Age Range"
                        className="mt-1"
                        styles={Utils.getReactSelectStyles()}
                    />
                </label>

                {/* Filter mode toggle */}
                <label className="flex items-center space-x-2 text-sm font-medium text-primary-600 mt-4 cursor-pointer">
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
        </div>



        // <div className="p-4 space-y-4 bg-white rounded shadow-sm">

        //     {/* Apply and reset filter buttons */}
        //     <div className="flex w-full justify-between">

        //         {/* Reset button */}
        //         <button
        //             type="button"
        //             onClick={handleResetFilters}
        //             className="px-4 py-2 rounded-md text-white text-sm font-medium transition bg-amber-600 hover:bg-amber-800"
        //         >
        //             Reset Filters
        //         </button>

        //         {/* Apply filters button */}
        //         <button
        //             type="button"
        //             onClick={handleApplyFilters}
        //             disabled={isApplyFilterButtonDisabled()}
        //             className="px-4 py-2 rounded-md text-white text-sm font-medium transition bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        //         >
        //             Apply Filters
        //         </button>
        //     </div>

        //     {/* Date filters */}
        //     <div className="flex flex-wrap gap-4 justify-between">
        //         {/* Date range */}
        //         <label className="flex flex-col text-sm font-semibold text-gray-600 w-44">
        //             Date Range
        //             <Select
        //                 options={dateRangeOptions}
        //                 menuPlacement="top"
        //                 placeholder="Select Date Range"
        //                 className="mt-1"
        //                 onChange={handleOnChangeDateRange}
        //                 styles={Utils.getReactSelectStyles()}
        //                 value={dateRangeOptions.find((option: DateRangeType) => option.value === pre.dateRangeFilterOption.selectedDateRange?.value) || null}
        //             />
        //         </label>
        //         {/* Start date */}
        //         <label className="flex flex-col text-sm font-semibold text-gray-600 w-36">
        //             Start Date
        //             <input
        //                 type="date"
        //                 className="mt-1 border rounded px-2 py-2 text-sm"
        //                 aria-label="on-date"
        //                 max={format(new Date(), 'yyyy-MM-dd')}
        //                 value={pre.dateRangeFilterOption.startDate || ""}
        //                 onChange={(e) => {
        //                     pre.dateRangeFilterOption.startDate = e.target.value;
        //                     setRefresh({});
        //                 }}
        //             />
        //         </label>
        //         {/* End date */}
        //         <label className="flex flex-col text-sm font-semibold text-gray-600 w-36">
        //             End Date
        //             <input
        //                 type="date"
        //                 className="mt-1 border rounded px-2 py-2 text-sm"
        //                 aria-label="on-date"
        //                 max={format(new Date(), 'yyyy-MM-dd')}
        //                 value={pre.dateRangeFilterOption.endDate || ""}
        //                 onChange={(e) => {
        //                     pre.dateRangeFilterOption.endDate = e.target.value;
        //                     setRefresh({});
        //                 }}
        //             />
        //         </label>
        //     </div>

        //     {/* Age and radio buttons */}
        //     <div className="flex gap-2 justify-between flex-wrap">
        //         <label className="flex flex-col text-sm font-semibold text-gray-600 w-36">
        //             Age
        //             <Select
        //                 options={ageOptions}
        //                 value={pre.ageFilterOption.selectedAge}
        //                 onChange={handleOnChangeAge}
        //                 placeholder="Select Age Range"
        //                 className="mt-1"
        //                 styles={Utils.getReactSelectStyles()}
        //             />
        //         </label>

        //         {/* Radio buttons */}
        //         <div className="flex space-x-4 mt-4">
        //             {/* By Category radio button */}
        //             <label className="flex items-center space-x-2 cursor-pointer">
        //                 <input
        //                     type="radio"
        //                     name="filterMode"
        //                     value="category"
        //                     checked={pre.filterMode === "category"}
        //                     onChange={() => {
        //                         pre.filterMode = "category";
        //                         pre.productCode = '';
        //                         setRefresh({})
        //                     }}
        //                     className="cursor-pointer"
        //                 />
        //                 <span className="text-sm font-medium text-primary-500">By Category / Brand / Tag</span>
        //             </label>

        //             {/* By product code radio button */}
        //             <label className="flex items-center space-x-2 cursor-pointer ml-2">
        //                 <input
        //                     type="radio"
        //                     name="filterMode"
        //                     value="productCode"
        //                     checked={pre.filterMode === "productCode"}
        //                     onChange={() => {
        //                         pre.filterMode = "productCode";
        //                         setRefresh({})
        //                     }}
        //                     className="cursor-pointer"
        //                 />
        //                 <span className="text-sm font-medium text-primary-500">By Product Code</span>
        //             </label>
        //         </div>
        //     </div>

        //     {/* Category filters */}
        //     {pre.filterMode === 'category' && <div>
        //         {/* Category Filter */}
        //         <div className="space-y-2">
        //             <label className="text-sm font-semibold text-gray-600">
        //                 Categories
        //             </label>
        //             <DropDownTreeComponent
        //                 className="h-10"
        //                 id="dropDowntree"
        //                 ref={catRef}
        //                 showClearButton={false}
        //                 placeholder="Select a category ..."
        //                 fields={fields}
        //                 allowMultiSelection={false}
        //                 popupHeight="300px"
        //                 allowFiltering={true}
        //                 filterBarPlaceholder="Search"
        //                 select={handleOnChangeCategory}
        //                 created={() => {
        //                     if (catRef.current) {
        //                         setCategory();
        //                     }
        //                 }}
        //             />
        //         </div>

        //         {/* Brand and Tag Filters */}
        //         <div className="flex flex-wrap gap-4">
        //             {/* Brands */}
        //             <label className="flex flex-col text-sm font-semibold text-gray-600 flex-1 min-w-[200px]">
        //                 Brands
        //                 <Select
        //                     className="mt-1 w-full"
        //                     getOptionLabel={(option: BrandType) => option.brandName}
        //                     getOptionValue={(option: BrandType) => option.id as any}
        //                     options={brandOptions}
        //                     styles={Utils.getReactSelectStyles()}
        //                     value={pre.catFilterOption.selectedBrand}
        //                     onChange={handleOnChangeBrand}
        //                     placeholder="Select a brand..."
        //                 />
        //             </label>

        //             {/* Tags */}
        //             <label className="flex flex-col text-sm font-semibold text-gray-600 flex-1 min-w-[200px]">
        //                 Tags
        //                 <Select
        //                     className="mt-1 w-full"
        //                     getOptionLabel={(option: TagType) => option.tagName}
        //                     getOptionValue={(option: TagType) => option.id as any}
        //                     options={tagOptions}
        //                     styles={Utils.getReactSelectStyles()}
        //                     value={pre.catFilterOption.selectedTag}
        //                     onChange={handleOnChangeTag}
        //                     placeholder="Select a tag..."
        //                 />
        //             </label>
        //         </div>
        //     </div>}

        //     {/* Product Code */}
        //     {pre.filterMode === "productCode" && (
        //         <div className="relative w-full max-w-xs">
        //             <label className="flex flex-col text-sm font-semibold text-gray-400 mb-15">
        //                 Product Code
        //                 <NumericFormat
        //                     className="border-spacing-1 border-gray-300 h-10 rounded-md border-2 bg-white mt-1"
        //                     allowNegative={false}
        //                     autoFocus={true}
        //                     decimalScale={0}
        //                     fixedDecimalScale={true}
        //                     onFocus={(event: any) => event.target.select()}
        //                     placeholder="Enter Product Code"
        //                     value={pre.productCode}
        //                     onValueChange={(values: NumberFormatValues) => {
        //                         const { value } = values;
        //                         pre.productCode = value || null;
        //                         setRefresh({});
        //                     }}
        //                 />
        //             </label>
        //             {pre.productCode && (
        //                 <button
        //                     type="button"
        //                     className="absolute right-2 top-2/3 -translate-y-1/2 text-gray-400 hover:text-red-500"
        //                     onClick={() => {
        //                         pre.productCode = '';
        //                         setRefresh({});
        //                     }}
        //                 >
        //                     ✕
        //                 </button>
        //             )}

        //         </div>
        //     )}

        // </div>
    )

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
        Utils.showHideModalDialogA({ isOpen: false })
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

    function handleOnChangeDateRange(selected: any) {
        if (!selected) return
        pre.dateRangeFilterOption.selectedDateRange = selected;
        setDateRange(selected);
        setRefresh({});
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

}

type JsonResultType = {
    brands: BrandType[];
    categories: CategoryNodeType[];
    tags: TagType[];
};

type MetaType = SalesReportPayloadActionType