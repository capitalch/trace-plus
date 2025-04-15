import { useEffect, useState } from "react";
import { CompReactSelect } from "../../../../../../controls/components/comp-react-select";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { DropDownTreeComponent, FieldsModel } from "@syncfusion/ej2-react-dropdowns";

export function PurchasePriceVariationFilterControl() {
  const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
  const [tagOptions, setTagOptions] = useState<TagType[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();

  useEffect(() => {
    loadAllOptions();
  }, []);

  const fields: FieldsModel = {
    dataSource: treeData as any,
    value: 'id',
    text: 'name',
    child: 'child'
  }

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
      <label className="flex flex-col font-medium text-primary-800 gap-2">
        <span className="font-bold">Categories</span>
        <DropDownTreeComponent
          placeholder="Select category"
          fields={fields}
          popupHeight="300px"
          cssClass="custom-ddt"
          allowFiltering={true}
          filterBarPlaceholder="Search"
        />
      </label>

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

  // function handleCategoriesOnChange(value: any) {
  //   console.log(value);
  // }

  function handleTagsOnChange(selectedTag: TagType) {
    console.log(selectedTag);
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
        setBrandOptions(jsonResult?.brands || []);
        setTagOptions(jsonResult?.tags || []);
        buildHierarchicalTree(jsonResult?.categories || []);
      }
      console.log(res);
    } catch (e: any) {
      console.log(e);
    }
  }

  function buildHierarchicalTree(flatList: CategoryType[]) {
    const nodeMap = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    for (const item of flatList) {
      nodeMap.set(item.id, {
        id: item.id,
        name: item.catName,
        parentId: item.parentId,
        hasChildren: !item.isLeaf,
        child: []
      });
    }

    for (const node of nodeMap.values()) {
      if (node.parentId === null) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.child!.push(node);
        }
      }
    }
    setTreeData(roots)
    // return roots;
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
type TreeNode = {
  id: number;
  name: string;
  parentId: number | null;
  hasChildren?: boolean;
  child?: TreeNode[];
};