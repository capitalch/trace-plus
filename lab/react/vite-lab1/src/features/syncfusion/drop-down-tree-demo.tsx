import { DropDownTreeComponent } from "@syncfusion/ej2-react-dropdowns";
import { useEffect, useState } from "react";
import _ from 'lodash'

export function DropDownTreeDemo() {
  const [,setRefresh] = useState({})
  const [catOptions, setCatOptions] = useState<CategoryType[]>([])
  const [selectedCatOption, setSelectedCatOption] = useState<CategoryType | null>(null)

  useEffect(() => {
    if (_.isEmpty(catOptions)) {
      loadData()
    } else {
      // setValue(['0'])
      setSelectedCatOption({ id: '1', pid: '', name: '' })
    }
  }, [catOptions])

  return (
    <div className="w-80 m-4">
      <h4>Select an item from DropDownTree</h4>
      <DropDownTreeComponent
        id="dropDowntree"
        allowMultiSelection={false}
        fields={{
          dataSource: catOptions as any,
          value: "id",
          parentValue: "pid",
          text: "name",
          hasChildren: "hasChild"
        }}
        placeholder="Select a category"
        // value={value}
        value={[selectedCatOption?.id ?? '']}
      />
      <button onClick={()=>{
        setRefresh({})
      }}>Refresh</button>
    </div>
  );
  function loadData() {
    setCatOptions(sampleData)
  }
}

const sampleData = [
  { id: "0", name: "All categories", pid: null, isLeaf: true },
  { id: "1", name: "Furniture", hasChild: true, pid: null, isLeaf: false },
  { id: "2", pid: "1", name: "Tables & Chairs", },
  { id: "3", pid: "1", name: "Sofas", },
  { id: "4", pid: "1", name: "Occasional Furniture", },

  { id: "5", name: "Decor", hasChild: true, pid: null },
  { id: "6", pid: "5", name: "Bed Linen", },
  { id: "7", pid: "5", name: "Curtains & Blinds", },
  { id: "8", pid: "5", name: "Carpets", },

  { id: "9", name: "Electronics", hasChild: true, pid: null },
  { id: "10", pid: "9", name: "Televisions", },
  { id: "11", pid: "9", name: "Home Entertainment", },
  { id: "12", pid: "9", name: "Projectors", }
];

// interface TreeData {
//   id: string | null | number;
//   name: string;
//   hasChild?: boolean;
//   expanded?: boolean;
//   pid?: string | null | number; // parent id
// }

export type CategoryType = {
  id: string;
  name: string;
  pid: string | null;
  isLeaf?: boolean;
  hasChild?: boolean;
};