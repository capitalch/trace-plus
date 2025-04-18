import { useEffect, useState } from "react";
import ReactSlidingPane from "react-sliding-pane";
import { FilterControl } from "./filter-control";

export function DropDownTreeNewDemo() {
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [catData, setCatData] = useState<CategoryType[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="m-4 flex">
      <button
        className="px-2 py-1 ml-auto bg-primary-500 text-white rounded-lg"
        onClick={openPane}
      >
        Open
      </button>
      <ReactSlidingPane
        isOpen={isPaneOpen}
        title="Filter Options"
        onRequestClose={() => setIsPaneOpen(false)}
        width="500px"
      >
        <FilterControl catData={catData} />
      </ReactSlidingPane>
    </div>
  );

  function openPane() {
    setIsPaneOpen(true);
  }

  function loadData() {
    const cts: CategoryType[] = cats.map((cat: CategoryType) => ({
      ...cat,
      hasChild: !cat.isLeaf
    }));
    setCatData(cts);
  }
}

export type CategoryType = {
  id: string | number;
  catName: string;
  parentId: string | number | null;
  isLeaf?: boolean;
  hasChild?: boolean;
};

export type BrandType = { id: number | null; brandName: string };

export type TagType = { id: number | null; tagName: string };

const cats = [
  { id: "", catName: "All categories", parentId: null, isLeaf: false },
  { id: 161, catName: "*****", parentId: null, isLeaf: false },
  { id: 162, catName: "*****", parentId: 161, isLeaf: true },
  { id: 71, catName: "Adapter", parentId: 65, isLeaf: true },
  { id: 89, catName: "Adapter", parentId: 85, isLeaf: true },
  { id: 107, catName: "Air conditioners", parentId: null, isLeaf: false },
  { id: 80, catName: "Air cross", parentId: 65, isLeaf: true },
  { id: 181, catName: "Air Fryer", parentId: 119, isLeaf: true },
  { id: 148, catName: "Antivirus", parentId: 85, isLeaf: true },
  { id: 70, catName: "Bag", parentId: 65, isLeaf: true },
  { id: 177, catName: "Ball Head", parentId: 65, isLeaf: true },
  { id: 93, catName: "Battery", parentId: 85, isLeaf: true },
  { id: 66, catName: "Battery", parentId: 65, isLeaf: true },
  { id: 170, catName: "Battery Grip", parentId: 65, isLeaf: true },
  { id: 184, catName: "Beater", parentId: 119, isLeaf: true },
  { id: 129, catName: "Beauty products", parentId: null, isLeaf: false },
  { id: 81, catName: "Binocular", parentId: 62, isLeaf: true },
  { id: 122, catName: "Blender", parentId: 119, isLeaf: true },
  { id: 79, catName: "Body cap", parentId: 65, isLeaf: true },
  { id: 164, catName: "Bottle", parentId: 119, isLeaf: true },
  { id: 88, catName: "Calculator", parentId: 82, isLeaf: true },
  { id: 65, catName: "Camera accessories", parentId: 62, isLeaf: false },
  { id: 169, catName: "Camera Grip", parentId: 65, isLeaf: true },
  { id: 64, catName: "Camera lens", parentId: 62, isLeaf: true },
  { id: 76, catName: "Camera memory card", parentId: 65, isLeaf: true },
  { id: 151, catName: "Camera Microphone", parentId: 65, isLeaf: true },
  { id: 62, catName: "Cameras and accessories", parentId: null, isLeaf: false },
  { id: 156, catName: "Card Reader", parentId: 65, isLeaf: true },
  { id: 92, catName: "Charger", parentId: 85, isLeaf: true },
  { id: 67, catName: "Charger", parentId: 65, isLeaf: true },
  { id: 121, catName: "Chopper", parentId: 119, isLeaf: true },
  { id: 188, catName: "Clamp", parentId: 65, isLeaf: true },
  { id: 190, catName: "Cleaning Kit", parentId: 65, isLeaf: true },
  {
    id: 85,
    catName: "Computer and mobile accessories",
    parentId: null,
    isLeaf: false
  },
  {
    id: 82,
    catName: "Computers and calculators",
    parentId: null,
    isLeaf: false
  },
  { id: 112, catName: "Cooker", parentId: 119, isLeaf: true },
  { id: 163, catName: "Cookware", parentId: 119, isLeaf: true },
  { id: 147, catName: "Cooler", parentId: 137, isLeaf: true },
  { id: 95, catName: "Data Cable", parentId: 85, isLeaf: true },
  { id: 83, catName: "Desktop computer", parentId: 82, isLeaf: true },
  { id: 63, catName: "Digital camera", parentId: 62, isLeaf: true },
  { id: 179, catName: "Digital Thermometer", parentId: 145, isLeaf: true },
  { id: 176, catName: "Digital watch", parentId: 145, isLeaf: true },
  { id: 72, catName: "Dry cabinet", parentId: 65, isLeaf: true },
  { id: 94, catName: "Earbud", parentId: 85, isLeaf: true },
  { id: 91, catName: "Earphone", parentId: 85, isLeaf: true },
  { id: 116, catName: "Electric iron", parentId: 110, isLeaf: true },
  { id: 120, catName: "Electric kettle", parentId: 119, isLeaf: true },
  {
    id: 137,
    catName: "Electronic goods and accessories",
    parentId: null,
    isLeaf: false
  },
  { id: 191, catName: "Eyepiece", parentId: 65, isLeaf: true },
  { id: 157, catName: "Film", parentId: 65, isLeaf: true },
  { id: 68, catName: "Filter", parentId: 65, isLeaf: true },
  { id: 73, catName: "Flash light", parentId: 65, isLeaf: true },
  { id: 166, catName: "Flash Trigger", parentId: 65, isLeaf: true },
  { id: 114, catName: "Geyser", parentId: 110, isLeaf: true },
  { id: 77, catName: "Gimble", parentId: 65, isLeaf: true },
  { id: 159, catName: "Graphics Card", parentId: 85, isLeaf: true },
  { id: 135, catName: "Hair clipper", parentId: 129, isLeaf: true },
  { id: 133, catName: "Hair curler", parentId: 129, isLeaf: true },
  { id: 131, catName: "Hair dryer", parentId: 129, isLeaf: true },
  { id: 136, catName: "Hair straightner", parentId: 129, isLeaf: true },
  { id: 130, catName: "Hair styler", parentId: 129, isLeaf: true },
  { id: 132, catName: "Hair trimmer", parentId: 129, isLeaf: true },
  { id: 98, catName: "Hard disk", parentId: 85, isLeaf: true },
  { id: 90, catName: "Headphone", parentId: 85, isLeaf: true },
  { id: 110, catName: "Home appliances", parentId: null, isLeaf: false },
  { id: 172, catName: "Honeycomb Grid", parentId: 65, isLeaf: true },
  { id: 118, catName: "Immersion rod", parentId: 110, isLeaf: true },
  { id: 128, catName: "Induction", parentId: 119, isLeaf: true },
  { id: 124, catName: "Juicer", parentId: 119, isLeaf: true },
  { id: 99, catName: "Keyboard", parentId: 85, isLeaf: true },
  { id: 143, catName: "Keyboard bag", parentId: 137, isLeaf: true },
  { id: 142, catName: "Keyboard stand", parentId: 137, isLeaf: true },
  { id: 119, catName: "Kitchen appliances", parentId: null, isLeaf: false },
  { id: 84, catName: "Laptop computer", parentId: 82, isLeaf: true },
  { id: 139, catName: "LED tv", parentId: 137, isLeaf: true },
  { id: 75, catName: "Lens cap", parentId: 65, isLeaf: true },
  { id: 160, catName: "Lens Cleaner", parentId: 65, isLeaf: true },
  { id: 178, catName: "Lens Cover", parentId: 65, isLeaf: true },
  { id: 74, catName: "Lens hood", parentId: 65, isLeaf: true },
  { id: 145, catName: "Lifestyle products", parentId: null, isLeaf: false },
  { id: 158, catName: "Light Stand", parentId: 65, isLeaf: true },
  { id: 186, catName: "Light Stick", parentId: 65, isLeaf: true },
  { id: 187, catName: "Light Stud", parentId: 65, isLeaf: true },
  { id: 183, catName: "Light Tent", parentId: 65, isLeaf: true },
  { id: 97, catName: "Memory card", parentId: 85, isLeaf: true },
  { id: 154, catName: "Microphone", parentId: 137, isLeaf: true },
  { id: 126, catName: "Microwave oven", parentId: 119, isLeaf: true },
  { id: 123, catName: "Mixer grinder", parentId: 119, isLeaf: true },
  { id: 87, catName: "Mobile phones", parentId: 86, isLeaf: true },
  { id: 149, catName: "Mount Adapter", parentId: 65, isLeaf: true },
  { id: 168, catName: "Mount Converter", parentId: 65, isLeaf: true },
  { id: 100, catName: "Mouse", parentId: 85, isLeaf: true },
  { id: 105, catName: "Mouse pad", parentId: 85, isLeaf: true },
  { id: 141, catName: "Musical keyboard", parentId: 137, isLeaf: true },
  { id: 167, catName: "Music Player", parentId: 137, isLeaf: true },
  { id: 140, catName: "OLED tv", parentId: 137, isLeaf: true },
  { id: 127, catName: "OTG", parentId: 119, isLeaf: true },
  { id: 174, catName: "Parabolic Softbox", parentId: 65, isLeaf: true },
  { id: 104, catName: "Pendrive", parentId: 85, isLeaf: true },
  { id: 86, catName: "Phones", parentId: null, isLeaf: false },
  { id: 185, catName: "Photo Box", parentId: 65, isLeaf: true },
  { id: 101, catName: "Powerbank", parentId: 85, isLeaf: true },
  { id: 102, catName: "Printer", parentId: 85, isLeaf: true },
  { id: 138, catName: "Radio", parentId: 137, isLeaf: true },
  { id: 173, catName: "Reflector", parentId: 65, isLeaf: true },
  { id: 111, catName: "Refrigerator", parentId: 110, isLeaf: true },
  { id: 182, catName: "Remote Control", parentId: 65, isLeaf: true },
  { id: 113, catName: "Rice cooker", parentId: 110, isLeaf: true },
  { id: 150, catName: "Ring Light", parentId: 65, isLeaf: true },
  { id: 117, catName: "Roti maker", parentId: 110, isLeaf: true },
  { id: 103, catName: "Router", parentId: 85, isLeaf: true },
  { id: 180, catName: "Screen Guard ", parentId: 65, isLeaf: true },
  { id: 134, catName: "Shaver", parentId: 129, isLeaf: true },
  { id: 155, catName: "Smart Band", parentId: 145, isLeaf: true },
  { id: 106, catName: "SMPS", parentId: 85, isLeaf: true },
  { id: 96, catName: "Speaker", parentId: 85, isLeaf: true },
  { id: 175, catName: "Speedlite Bracket", parentId: 65, isLeaf: true },
  { id: 108, catName: "Split air conditioner", parentId: 107, isLeaf: true },
  { id: 78, catName: "Strap", parentId: 65, isLeaf: true },
  { id: 152, catName: "Teleconverter", parentId: 65, isLeaf: true },
  { id: 125, catName: "Toaster", parentId: 119, isLeaf: true },
  { id: 69, catName: "Tripod", parentId: 65, isLeaf: true },
  { id: 153, catName: "Tripod Grip", parentId: 65, isLeaf: true },
  { id: 144, catName: "Video game", parentId: 137, isLeaf: true },
  { id: 115, catName: "Washing machine", parentId: 110, isLeaf: true },
  { id: 146, catName: "Watch", parentId: 145, isLeaf: true },
  { id: 189, catName: "waterproof Dive", parentId: 65, isLeaf: true },
  { id: 109, catName: "Windows air conditioner", parentId: 107, isLeaf: true }
];
