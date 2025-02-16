// src/App.tsx  
import React from 'react';
import { GenericFilteringGrid } from './generic-filtering-grid';
import { DynamicBuiltinGrid } from './dynamic-builtin';

const GenericFilteringGridContainer: React.FC = () => {
  // Sample data for the grid  
  const data = [
    { id: 1, name: "John", age: 30, country: "USA" },
    { id: 2, name: "Jane", age: 25, country: "UK" },
    { id: 3, name: "Tom", age: 35, country: "Canada" },
    { id: 4, name: "Sara", age: 28, country: "USA" },
    { id: 5, name: "Michael", age: 22, country: "UK" },
  ];

  // Column definitions  
  const columns = [
    { field: 'id', headerText: 'ID', width: '100' },
    { field: 'name', headerText: 'Name1', width: '150' },
    { field: 'age', headerText: 'Age', width: '100' },
    { field: 'country', headerText: 'Country', width: '150' },
  ];

  return (
    <div className="">
      <DynamicBuiltinGrid data={data} columns={columns} />
    </div>
  );
}

export default GenericFilteringGridContainer;