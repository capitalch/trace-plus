import { useEffect, useRef, useState } from "react";
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
    setSelectedBrand,
    setSelectedCategory,
    setSelectedTag
} from "../../../../accounts-slice";

export function PurchasePriceVariationFilterControl() {
    const dispatch: AppDispatchType = useDispatch();
    const catRef = useRef<DropDownTreeComponent | null>(null)
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

    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
    const [tagOptions, setTagOptions] = useState<TagType[]>([]);
    const [catOptions, setCatOptions] = useState<CategoryNodeType[]>([]);

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
        } else {
            if ((!_.isEmpty(selectedCatOption)) && catRef.current) {
                catRef.current.value = [selectedCatOption.id]
                catRef.current.ensureVisible(selectedCatOption.id)
            }
            // if (
            //     _.isEmpty(selectedBrandOption) &&
            //     _.isEmpty(selectedCatOption) &&
            //     _.isEmpty(selectedTagOption)
            // ) {
            //     dispatch(setSelectedBrand(brandOptions[0]));
            //     dispatch(setSelectedTag(tagOptions[0]));
            //     // dispatch(setSelectedCategory(catOptions[0]));
            // }
            // if (!_.isEmpty(selectedCatOption)) {
            //     // dispatch(setSelectedCategory({ id: +selectedCatOption.id, catName: selectedCatOption.catName, parentId: selectedCatOption.parentId, hasChild: selectedCatOption.hasChild }));
            // }
        }
    }, [brandOptions, tagOptions, catOptions]);

    // console.log(selectedCatOption);
    return (
        <div className="flex flex-col gap-4">

            {/* Categories */}
            <label className="flex flex-col font-medium text-primary-800 gap-2">
                <span className="font-bold">Categories</span>
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
                    //   value={selectedCatOption?.id ?? 0 as any}
                    // value={[selectedCatOption?.id ?? "0"]}
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
            {/* <button
                type="button"
                onClick={() => {
                    if (catRef.current?.treeViewObj) {
                        const tree = catRef.current.treeViewObj;
                        
                        // Expand parent of selected node
                        tree.expandNode(tree.getNode(catRef.current.treeViewObj.getTreeData().find(node => node.id === '1')));
                      }
                }}
            >
                Expand
            </button> */}
        </div>
    );

    function handleOnChangeBrand(selected: BrandType | null) {
        dispatch(setSelectedBrand(selected));
        dispatch(setSelectedTag(tagOptions[0]));
        if(catRef?.current){
            catRef.current.value = [""]
        }
    }

    function handleOnChangeTag(selected: TagType | null) {
        dispatch(setSelectedBrand(brandOptions[0]));
        dispatch(setSelectedTag(selected));
        if(catRef?.current){
            catRef.current.value = [""]
        }
    }

    function handleOnChangeCategory(e: DdtSelectEventArgs) {
        const item: any = e.itemData
        dispatch(setSelectedCategory({
            id: item.id,
            catName: item.text,
        }));
        if (e.isInteracted) {
            dispatch(setSelectedTag(tagOptions[0]));
            dispatch(setSelectedBrand(brandOptions[0]));
        }
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
                const brands = jsonResult.brands;
                brands.unshift({ brandName: "All brands", id: null });
                setBrandOptions(brands);

                const tags = jsonResult.tags;
                tags.unshift({ tagName: "All tags", id: null });
                setTagOptions(tags);

                const cats = jsonResult.categories;
                cats.unshift({
                    catName: "All categoris",
                    id: '',
                    isLeaf: true,
                    parentId: null
                });
                cats.forEach((cat: CategoryNodeType) => {
                    cat.hasChild = !cat.isLeaf
                    // cat.expanded = true
                });
                setCatOptions(cats);
            }
        } catch (e: any) {
            console.log(e);
        }
    }
}

export type BrandType = { id: number | null; brandName: string };

export type CategoryType = {
    id: string;
    catName: string;
}
export type CategoryNodeType = {
    id: string | number;
    catName: string;
    parentId: string | null;
    isLeaf?: boolean;
    hasChild?: boolean;
    expanded?:boolean
};

type JsonResultType = {
    brands: BrandType[];
    categories: CategoryNodeType[];
    tags: TagType[];
};
export type TagType = { id: number | null; tagName: string };
