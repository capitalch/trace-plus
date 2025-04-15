import { useEffect, useState } from "react";
import { CompReactSelect } from "../../../../../../controls/components/comp-react-select";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import {
  DropDownTreeComponent,
  FieldsModel
} from "@syncfusion/ej2-react-dropdowns";

export function PurchasePriceVariationFilterControl() {
  const [, setRefresh] = useState({});
  const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
  const [tagOptions, setTagOptions] = useState<TagType[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();

  const [brandId, setBrandId] = useState<number | null>(null);
  const [catId, setCatId] = useState<number | null>(1);

  useEffect(() => {
    loadAllOptions();
  }, []);

  const fields: FieldsModel = {
    dataSource: treeData as any,
    value: "id",
    text: "name",
    child: "child"
  };

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
          selectedValue={brandId}
          staticOptions={brandOptions}
        />
      </label>

      {/* Categories */}
      <label className="flex flex-col font-medium text-primary-800 gap-2">
        <span className="font-bold">Categories</span>
        <DropDownTreeComponent
          placeholder="Select category ..."
          fields={fields}
          popupHeight="300px"
          allowFiltering={true}
          filterBarPlaceholder="Search"
          value={catId as any}
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
      <button type="button" onClick={() => setCatId(3)}>
        Test
      </button>
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
    setBrandId(null);
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
        jsonResult.brands?.unshift({ brandName: "All brands", id: null });
        jsonResult.tags.unshift({ tagName: "All tags", id: null });
        jsonResult.categories.unshift({
          catName: "All categoris",
          id: null,
          isLeaf: true,
          parentId: null
        });
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
    const nodeMap = new Map<number | null, TreeNode>();
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
    setTreeData(roots);
    // return roots;
  }
}

type JsonResultType = {
  brands?: BrandType[];
  categories: CategoryType[];
  tags: TagType[];
};

type BrandType = { id: number | null; brandName: string };
type TagType = { id: number | null; tagName: string };
type CategoryType = {
  id: number | null;
  catName: string;
  parentId: number | null;
  isLeaf: boolean;
};
type TreeNode = {
  id: number | null;
  name: string;
  parentId: number | null;
  hasChildren?: boolean;
  child?: TreeNode[];
};
