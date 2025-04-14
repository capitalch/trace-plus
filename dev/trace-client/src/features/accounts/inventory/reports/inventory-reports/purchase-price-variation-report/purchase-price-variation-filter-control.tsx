import { useEffect, useState } from "react";
import { CompReactSelect } from "../../../../../../controls/components/comp-react-select";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { TreeSelect } from "primereact/treeselect";
import { TreeNode } from "primereact/treenode";
import CategoryTreeSelect from "./category-tree-select";

export function PurchasePriceVariationFilterControl() {
  const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
  const [tagOptions, setTagOptions] = useState<TagType[]>([]);
  const [catOptions, setCatOptions] = useState<TreeNode[]>([])
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();

  useEffect(() => {
    loadOptions();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Brands */}
      <label className="flex flex-col font-medium text-primary-800 gap-2">
        <span className="font-bold">Brands</span>
        <CompReactSelect
          optionLabelName="brandName"
          optionValueName="id"
          onChange={handleBrandsOnChange}
          placeHolder="Select brand ..."
          ref={null}
          selectedValue={null}
          staticOptions={brandOptions}
        />
      </label>

      {/* Categories */}
      <div className="flex flex-col font-medium text-primary-800 gap-2">
        <span className="font-bold">Categories</span>
        <TreeSelect className="custom-tree-select"
          options={treeData}
        //   style={{ marginLeft: "0.8rem" }}
          onChange={(e: any) => handleCategoriesOnChange(e.value)}
        //   value={null}
        />
      </div>

      {/* <CategoryTreeSelect /> */}

      {/* tags */}
      <label className="flex flex-col font-medium text-primary-800 gap-2">
        <span className="font-bold">Tags</span>
        <CompReactSelect
          optionLabelName="tagName"
          optionValueName="id"
          onChange={handleTagsOnChange}
          placeHolder="Select tag ..."
          ref={null}
          selectedValue={null}
          staticOptions={tagOptions}
        />
      </label>
    </div>
  );

  function handleBrandsOnChange(selectedBrand: BrandType) {
    console.log(selectedBrand);
  }

  function handleCategoriesOnChange(value: any) {
    console.log(value);
  }

  function handleTagsOnChange(selectedTag: TagType) {
    console.log(selectedTag);
  }

  async function loadOptions() {
    try {
      const res = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        sqlId: SqlIdsMap.getBrandsCategoriesTags
      });
      const jsonResult: JsonResultType = res?.[0]?.jsonResult;
      if (jsonResult) {
        setBrandOptions(jsonResult?.brands || []);
        setTagOptions(jsonResult?.tags || []);
        buildTreeSelectOptions(jsonResult?.categories || []);
      }
      console.log(res);
    } catch (e: any) {
      console.log(e);
    }
  }

  function buildTreeSelectOptions(flatList: CategoryType[]): TreeNode[] {
    const map: { [key: number]: TreeNode } = {};
    const roots: TreeNode[] = [];

    // First, convert to node objects
    flatList.forEach((item) => {
      map[item.id] = {
        key: item.id,
        label: item.catName,
        data: item,
        leaf: item.isLeaf,
        selectable: true,
        children: []
      };
    });

    // Then, link them into a tree
    flatList.forEach((item) => {
      if (item.parentId === null) {
        roots.push(map[item.id]);
      } else {
        const parent = map[item.parentId];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(map[item.id]);
        }
      }
    });
    setCatOptions(roots)
    return roots;
  }
}

type JsonResultType = {
  brands?: BrandType[];
  categories: CategoryType[];
  tags: { id: number; tagName: string }[];
};

type BrandType = { id: number; brandName: string };
type TagType = { id: number; tagName: string };
type CategoryType = {
  id: number;
  catName: string;
  parentId: number | null;
  isLeaf: boolean;
};

const treeData = [
    {
      key: '0',
      label: 'Root',
      children: [
        { key: '0-0', label: 'Child 1' },
        { key: '0-1', label: 'Child 2' }
      ]
    }
  ];