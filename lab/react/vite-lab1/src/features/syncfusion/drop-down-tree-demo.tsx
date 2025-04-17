import { DropDownTreeComponent } from "@syncfusion/ej2-react-dropdowns";
import { useState } from "react";

export function DropDownTreeDemo() {
  const [value, setValue] = useState<string[]>(["1"]);

  return (
    <div className="w-80 m-4">
      <h4>Select an item from DropDownTree</h4>
      <DropDownTreeComponent
        id="dropDowntree"
        allowMultiSelection={false}
        fields={{
          dataSource: sampleData as any,
          value: "id",
          parentValue: "pid",
          text: "name",
          hasChildren: "hasChild"
        }}
        placeholder="Select a category"
        value={value}
      />
    </div>
  );
}

const sampleData = [
  { id: "0", name: "All categories", hasChild: undefined, expanded: undefined, pid: null },
  { id: "1", name: "Furniture", hasChild: true, expanded: true, pid: null },
  { id: "2", pid: "1", name: "Tables & Chairs", hasChild: undefined, expanded: undefined },
  { id: "3", pid: "1", name: "Sofas", hasChild: undefined, expanded: undefined },
  { id: "4", pid: "1", name: "Occasional Furniture", hasChild: undefined, expanded: undefined },

  { id: "5", name: "Decor", hasChild: true, expanded: undefined, pid: null },
  { id: "6", pid: "5", name: "Bed Linen", hasChild: undefined, expanded: undefined },
  { id: "7", pid: "5", name: "Curtains & Blinds", hasChild: undefined, expanded: undefined },
  { id: "8", pid: "5", name: "Carpets", hasChild: undefined, expanded: undefined },

  { id: "9", name: "Electronics", hasChild: true, expanded: undefined, pid: null },
  { id: "10", pid: "9", name: "Televisions", hasChild: undefined, expanded: undefined },
  { id: "11", pid: "9", name: "Home Entertainment", hasChild: undefined, expanded: undefined },
  { id: "12", pid: "9", name: "Projectors", hasChild: undefined, expanded: undefined }
];

interface TreeData {
  id: string | null | number;
  name: string;
  hasChild?: boolean;
  expanded?: boolean;
  pid?: string | null | number; // parent id
}
