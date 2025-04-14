import  { useState, useEffect } from 'react';
import { TreeSelect } from 'primereact/treeselect';
import { TreeNode } from 'primereact/treenode';

type CategoryOption = {
  id: number;
  catName: string;
  parentId: number | null;
  isLeaf: boolean;
};

const flatCatOptions: CategoryOption[] = [
  { id: 1, catName: 'Electronics', parentId: null, isLeaf: false },
  { id: 2, catName: 'Laptops', parentId: 1, isLeaf: true },
  { id: 3, catName: 'Mobiles', parentId: 1, isLeaf: true },
  { id: 4, catName: 'Fashion', parentId: null, isLeaf: false },
  { id: 5, catName: 'Men', parentId: 4, isLeaf: false },
  { id: 6, catName: 'Shirts', parentId: 5, isLeaf: true },
  { id: 7, catName: 'T-Shirts', parentId: 5, isLeaf: true },
  { id: 8, catName: 'Women', parentId: 4, isLeaf: true }
];

function buildTreeSelectOptions(flatList: CategoryOption[]): TreeNode[] {
  const map: { [key: number]: TreeNode } = {};
  const roots: TreeNode[] = [];

  // First, convert to node objects
  flatList.forEach(item => {
    map[item.id] = {
      key: item.id,
      label: item.catName,
      data: item,
      leaf: item.isLeaf,
      selectable: true,
      children: [],
    };
  });

  // Then, link them into a tree
  flatList.forEach(item => {
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

  return roots;
}

export default function CategoryTreeSelect() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    const tree = buildTreeSelectOptions(flatCatOptions);
    setTreeData(tree);
  }, []);

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">Select Category</label>
      <TreeSelect
        value={selectedKey}
        options={treeData}
        onChange={(e:any) => setSelectedKey(e.value)}
        placeholder="Select a Category"
        className="w-full md:w-60"
        filter
      />
    </div>
  );
}
