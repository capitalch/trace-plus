import { useState } from 'react';
import Select from 'react-select';

type Option = {
  value: number | null;
  label: string;
  level?: number;
};

export default function FilterControl() {
  const brandOptions: Option[] = [
    { value: 1, label: 'Nike' },
    { value: 2, label: 'Adidas' },
    { value: 3, label: 'Puma' },
  ];

  const categoryOptions: Option[] = [
    { value: 10, label: 'Clothing', level: 0 },
    { value: 11, label: '– Men', level: 1 },
    { value: 12, label: '– – Shirts', level: 2 },
    { value: 13, label: '– – Pants', level: 2 },
    { value: 14, label: '– Women', level: 1 },
    { value: 15, label: '– – Dresses', level: 2 },
  ];

  const tagOptions: Option[] = [
    { value: 101, label: 'New Arrival' },
    { value: 102, label: 'Best Seller' },
    { value: 103, label: 'Clearance' },
  ];

  const [selectedBrand, setSelectedBrand] = useState<Option | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedTag, setSelectedTag] = useState<Option | null>(null);

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '2.5rem',
      borderRadius: '0.5rem',
    }),
    option: (base: any, state: any) => ({
      ...base,
      paddingLeft: `${(state.data.level ?? 0) * 1.25 + 0.75}rem`,
      backgroundColor: state.isFocused ? '#e0f2fe' : 'white',
    }),
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white shadow rounded-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
        <Select
          options={brandOptions}
          value={selectedBrand}
          onChange={setSelectedBrand}
          placeholder="Select brand"
          styles={customStyles}
          isClearable
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <Select
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="Select category"
          styles={customStyles}
          isClearable
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
        <Select
          options={tagOptions}
          value={selectedTag}
          onChange={setSelectedTag}
          placeholder="Select tag"
          styles={customStyles}
          isClearable
        />
      </div>
    </div>
  );
}
