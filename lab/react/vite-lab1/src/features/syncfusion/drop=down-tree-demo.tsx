import { DropDownTreeComponent } from "@syncfusion/ej2-react-dropdowns";
import { useState } from "react";


export function DropDownTreeDemo() {
  // Default selected value: can be a single id or an array of ids (for multiple)  
  // Here we set "3" which corresponds to "Sofas"  
  const [value, setValue] = useState<string | string[] >('0');

  return (
    <div style={{ margin: '30px', width: '300px' }}>
      <h4>Select an item from DropDownTree</h4>
      <DropDownTreeComponent
        id="dropDowntree"
        allowMultiSelection={false}
        fields={{
          dataSource: sampleData,
          value: 'id',
          parentValue: 'pid',
          text: 'name',
          hasChildren: 'hasChild',
        }}
        placeholder="Select a category"
        value={value as any}
        change={(e: any) => {
          setValue(e.value as string)
        }
        }// update value on change  
      />
      <p>
        Selected Value Id: <b>{value}</b>
      </p>
    </div>
  );
};

const sampleData: TreeData[] = [
  { id: '0', pid: null, name: 'All categories' },
  { id: 1, name: 'Furniture', hasChild: true, expanded: true },
  { id: 2, pid: 1, name: 'Tables & Chairs' },
  { id: 3, pid: 1, name: 'Sofas' },
  { id: 4, pid: 1, name: 'Occasional Furniture' },

  { id: 5, name: 'Decor', hasChild: true },
  { id: 6, pid: 5, name: 'Bed Linen' },
  { id: 7, pid: 5, name: 'Curtains & Blinds' },
  { id: 8, pid: 5, name: 'Carpets' },

  { id: 9, name: 'Electronics', hasChild: true },
  { id: 10, pid: 9, name: 'Televisions' },
  { id: 11, pid: 9, name: 'Home Entertainment' },
  { id: 12, pid: 9, name: 'Projectors' }
];

interface TreeData {
  id: string | null | number;
  name: string;
  hasChild?: boolean;
  expanded?: boolean;
  pid?: string | null | number; // parent id  
}  