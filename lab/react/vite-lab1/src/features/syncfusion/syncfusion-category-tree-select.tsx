// App.tsx or CategoryTreeSelect.tsx
import React from 'react';
import { DropDownTreeComponent, FieldSettingsModel, FieldsModel } from '@syncfusion/ej2-react-dropdowns';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-dropdowns/styles/material.css';

type CatOption = {
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

// Sample flat category array
const catOptions: CatOption[] = [
  { id: 1, catName: 'Electronics', parentId: null, isLeaf: false },
  { id: 2, catName: 'Laptops', parentId: 1, isLeaf: false },
  { id: 3, catName: 'Gaming Laptops', parentId: 2, isLeaf: true },
  { id: 4, catName: 'Business Laptops', parentId: 2, isLeaf: true },
  { id: 5, catName: 'Phones', parentId: 1, isLeaf: true },
  { id: 6, catName: 'Furniture', parentId: null, isLeaf: false },
  { id: 7, catName: 'Chairs', parentId: 6, isLeaf: true }
];

// Converts flat list to hierarchical structure
function buildHierarchicalTree(data: CatOption[]): TreeNode[] {
  const nodeMap = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  for (const item of data) {
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

  return roots;
}

export const SyncfusionCategoryTreeSelect: React.FC = () => {
  const treeData = buildHierarchicalTree(catOptions);

  const fields: FieldsModel = {
    dataSource: treeData as any,
    value: 'id',
    text: 'name',
    child: 'child'
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <label className="block mb-2 text-sm font-medium text-gray-700">Select Category</label>
      <DropDownTreeComponent
        placeholder="Choose a category"
        fields={fields}
        popupHeight="300px"
        cssClass="e-outline w-full"
        allowFiltering={true}
        filterBarPlaceholder="Search category"
      />
    </div>
  );
};

// export default CategoryTreeSelect;
