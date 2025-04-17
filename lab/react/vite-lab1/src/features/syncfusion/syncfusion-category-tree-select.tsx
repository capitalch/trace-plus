import React, { useState } from "react";
import {
  DropDownTreeComponent,
  FieldsModel
} from "@syncfusion/ej2-react-dropdowns";

export const SyncfusionCategoryTreeSelect: React.FC = () => {
  const treeData = catOptions.forEach(
    (x: CategoryType) => (x.hasChild = !x.isLeaf)
  );

  const fields: FieldsModel = {
    dataSource: treeData as any,
    value: "id",
    parentValue:"parentId",
    text: "catName",
    hasChildren: "hasChild"
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select Category
      </label>
      <DropDownTreeComponent
        placeholder="Choose a category"
        fields={fields}
        // popupHeight="300px"
        // cssClass="e-outline w-full"
        // allowFiltering={true}
        // filterBarPlaceholder="Search category"
        // value={2 as any}
        // value={value as any}
        // change={(e) => setValue(e.value)}
      />
    </div>
  );
};
// Sample flat category array
const catOptions: CategoryType[] = [
  { id: "1", catName: "Electronics", parentId: null, isLeaf: false },
  { id: "2", catName: "Laptops", parentId: "1", isLeaf: false },
  { id: "3", catName: "Gaming Laptops", parentId: "2", isLeaf: true },
  { id: "4", catName: "Business Laptops", parentId: "2", isLeaf: true },
  { id: "5", catName: "Phones", parentId: "1", isLeaf: true },
  { id: "6", catName: "Furniture", parentId: null, isLeaf: false },
  { id: "7", catName: "Chairs", parentId: "6", isLeaf: true }
];

export type CategoryType = {
  id: string;
  catName: string;
  parentId: string | null;
  isLeaf: boolean;
  hasChild?: boolean;
};
