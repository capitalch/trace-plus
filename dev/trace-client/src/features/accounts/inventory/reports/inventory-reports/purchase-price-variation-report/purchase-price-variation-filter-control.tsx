import { useEffect, useState } from "react";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import Select from "react-select";
import _ from "lodash";
import {
    DdtSelectEventArgs,
    DropDownTreeComponent,
    FieldsModel
} from "@syncfusion/ej2-react-dropdowns";
import {
    AppDispatchType,
    RootStateType
} from "../../../../../../app/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
    resetPurchasePriceVariationFilters,
    setSelectedBrand,
    setSelectedCategory,
    setSelectedTag
} from "../../../../accounts-slice";

export function PurchasePriceVariationFilterControl() {
    const dispatch: AppDispatchType = useDispatch();
    const selectedBrandOption = useSelector(
        (state: RootStateType) =>
            state.accounts.purchasePriceVariationFilterState.selectedBrand
    );
    const selectedCatOption = useSelector(
        (state: RootStateType) =>
            state.accounts.purchasePriceVariationFilterState.selectedCategory
    );
    const selectedTagOption = useSelector(
        (state: RootStateType) =>
            state.accounts.purchasePriceVariationFilterState.selectedTag
    );

    //   const [catId, setCatId] = useState<string[]>([""]);

    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
    // const [selectedBrandOption, setSelectedBrandOption] = useState<BrandType | null>(null)

    const [tagOptions, setTagOptions] = useState<TagType[]>([]);
    // const [selectedTagOption, setSelectedTagOption] = useState<TagType | null>(null)

    const [catOptions, setCatOptions] = useState<CategoryType[]>([]);
    // const [selectedCatOption, setSelectedCatOption] = useState<CategoryType | null>(null)

    const fields: FieldsModel = {
        dataSource: catOptions,
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
        } else {
            if (
                _.isEmpty(selectedBrandOption) &&
                _.isEmpty(selectedCatOption) &&
                _.isEmpty(selectedTagOption)
            ) {
                dispatch(setSelectedBrand(brandOptions[0]));
                dispatch(setSelectedTag(tagOptions[0]));
                dispatch(setSelectedCategory(catOptions[0]));
            }
            if (!_.isEmpty(selectedCatOption)) {
                dispatch(setSelectedCategory({ id: +selectedCatOption.id, catName: selectedCatOption.catName, parentId: selectedCatOption.parentId, hasChild: selectedCatOption.hasChild }));
            }
            // setSelectedBrandOption(brandOptions[0])
            // setSelectedTagOption(tagOptions[0])
            // setSelectedCatOption(catOptions[0])
            //   console.log(selectedCatOption);
        }
    }, [brandOptions, tagOptions, catOptions]);

    useEffect(() => {
        return () => {
            // dispatch(
            //     resetPurchasePriceVariationFilters())
        };
    }, []);
    console.log(selectedCatOption);
    return (
        <div className="flex flex-col gap-4">
            {/* Categories */}
            <label className="flex flex-col font-medium text-primary-800 gap-2">
                <span className="font-bold">Categories</span>
                <DropDownTreeComponent
                    id="dropDowntree"
                    showClearButton={false}
                    placeholder="Select category ..."
                    fields={fields}
                    allowMultiSelection={false}
                    popupHeight="300px"
                    allowFiltering={true}
                    filterBarPlaceholder="Search"
                    //   value={selectedCatOption?.id ?? 0 as any}
                    value={[selectedCatOption?.id ?? "0"]}
                    select={handleOnChangeCategory}
                />
            </label>

            {/* Brands */}
            <label className="flex flex-col font-medium text-primary-800 gap-2">
                <span className="font-bold">Brands</span>
                <Select
                    getOptionLabel={(option: BrandType) => option.brandName}
                    getOptionValue={(option: BrandType) => option.id as any}
                    options={brandOptions}
                    value={selectedBrandOption}
                    onChange={handleOnChangeBrand}
                    placeholder="Select a brand..."
                />
            </label>

            {/* Tags */}
            <label className="flex flex-col font-medium text-primary-800 gap-2">
                <span className="font-bold">Tags</span>
                <Select
                    getOptionLabel={(option: TagType) => option.tagName}
                    getOptionValue={(option: TagType) => option.id as any}
                    options={tagOptions}
                    value={selectedTagOption}
                    onChange={handleOnChangeTag}
                    placeholder="Select a brand..."
                />
            </label>
            <button
                type="button"
                onClick={() => {
                    dispatch(setSelectedCategory(catOptions[0]));
                }}
            >
                Test
            </button>
        </div>
    );

    function handleOnChangeBrand(selected: BrandType | null) {
        dispatch(setSelectedBrand(selected));
        dispatch(setSelectedTag(tagOptions[0]));
        dispatch(setSelectedCategory(catOptions[0]));

        // setSelectedTagOption(tagOptions[0])
        // setSelectedCatOption(catOptions[0])
        // setSelectedBrandOption(selected)
        // console.log("Selected brand:", selected);
    }

    function handleOnChangeTag(selected: TagType | null) {
        dispatch(setSelectedBrand(brandOptions[0]));
        dispatch(setSelectedCategory(catOptions[0]));
        dispatch(setSelectedTag(selected));

        // setSelectedTagOption(selected)
        // setSelectedBrandOption(brandOptions[0])
        // setSelectedCatOption(catOptions[0])
        // console.log("Selected tag:", selected);
    }

    function handleOnChangeCategory(e: DdtSelectEventArgs) {
        const item: any = e.itemData
        dispatch(setSelectedCategory({
            id: item.id,
            parentId: item.parentId,
            catName: item.text,
            hasChild: item.hasChildren,
            // isLeaf: !item.hasChildren
        }));
        if (e.isInteracted) {
            dispatch(setSelectedTag(tagOptions[0]));
            dispatch(setSelectedBrand(brandOptions[0]));
        }

        // setSelectedCatOption(e.itemData as any)
        // if (e.isInteracted) {
        //     setSelectedTagOption(tagOptions[0])
        //     setSelectedBrandOption(brandOptions[0])
        // }

        // console.log("Selected cat:", e);
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
            // const prettyJson = JSON.stringify(jsonResult, null, 2);
            // await navigator.clipboard.writeText(prettyJson); // browser only
            // console.log(JSON.stringify(jsonResult.categories))
            // console.log(JSON.stringify(jsonResult.brands))
            if (jsonResult) {
                const brands = jsonResult.brands;
                brands.unshift({ brandName: "All brands", id: null });
                setBrandOptions(brands);

                const tags = jsonResult.tags;
                tags.unshift({ tagName: "All tags", id: null });
                setTagOptions(tags);

                const cats = jsonResult.categories;
                cats.unshift({
                    catName: "All categoris",
                    id: 0,
                    isLeaf: true,
                    parentId: null
                });
                cats.forEach((cat: CategoryType) => (cat.hasChild = !cat.isLeaf));
                setCatOptions(cats);
            }
        } catch (e: any) {
            console.log(e);
        }
    }
}

export type BrandType = { id: number | null; brandName: string };
// export type CategoryType = {
//   id: string | null ;
//   catName: string;
//   parentId: number | null;
//   isLeaf: boolean;
//   hasChild?: boolean;
// };

export type CategoryType = {
    id: string;
    catName: string;
    parentId: string;
    isLeaf?: boolean;
    hasChild?: boolean;
};

type JsonResultType = {
    brands: BrandType[];
    categories: CategoryType[];
    tags: TagType[];
};
export type TagType = { id: number | null; tagName: string };
