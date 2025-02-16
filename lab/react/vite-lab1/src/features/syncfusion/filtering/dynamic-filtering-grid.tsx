// src/DynamicFilteringGrid.tsx  
import React, { useState } from 'react';  
import {  
  GridComponent,  
  ColumnsDirective,  
  ColumnDirective,  
  Inject,  
  Filter,  
} from '@syncfusion/ej2-react-grids';  

// Define the data type for your data  
interface DataItem {  
  id: number;  
  name: string;  
  age: number;  
  country: string;  
}  

// Sample data for the grid  
const initialData: DataItem[] = [  
  { id: 1, name: "John", age: 30, country: "USA" },  
  { id: 2, name: "Jane", age: 25, country: "UK" },  
  { id: 3, name: "Tom", age: 35, country: "Canada" },  
  { id: 4, name: "Sara", age: 28, country: "USA" },  
  { id: 5, name: "Michael", age: 22, country: "UK" },  
];  

// Define a type for filter conditions  
interface FilterCondition {  
  logicalOperator?: string; // AND / OR  
  column: string;  
  operator: string;  
  value: string;  
}  

export const DynamicFilteringGrid1: React.FC = () => {  
  const [filters, setFilters] = useState<FilterCondition[]>([  
    { logicalOperator: 'AND', column: 'name', operator: 'contains', value: '' }  
  ]);  

  const addFilterCondition = () => {  
    setFilters([...filters, { logicalOperator: 'AND', column: 'name', operator: 'contains', value: '' }]);  
  };  

  const handleFilterChange = (index: number, field: string, value: string) => {  
    const updatedFilters = filters.map((filter, i) =>  
      i === index ? { ...filter, [field]: value } : filter  
    );  
    setFilters(updatedFilters);  
  };  

  const getFilteredData = () => {  
    return initialData.filter((item) => {  
      return filters.reduce((accumulator, filter, index) => {  
        const { column, operator, value, logicalOperator } = filter;  
        const currentCondition = (() => {  
          if (operator === 'contains') {  
            return item[column as keyof DataItem].toString().toLowerCase().includes(value.toLowerCase());  
          } else if (operator === 'equal') {  
            return item[column as keyof DataItem] === value;  
          } else if (operator === 'greaterThan') {  
            // return item[column as keyof DataItem] > parseInt(value, 10);  
          }  
          return true;  
        })();  

        // Combine conditions based on logical operator  
        if (index === 0) {  
          return currentCondition; // First condition  
        }  
        return logicalOperator === 'AND' ? accumulator && currentCondition : accumulator || currentCondition;  
      }, true);  
    });  
  };  

  return (  
    <div>  
      <h3>Dynamic Multi-Column Filtering</h3>  
      {filters.map((filter, index) => (  
        <div key={index} style={{ marginBottom: '10px' }}>  
          <select  
            style={{ marginRight: '10px' }}  
            value={filter.logicalOperator}  
            onChange={(e) => handleFilterChange(index, 'logicalOperator', e.target.value)}  
          >  
            <option value="AND">AND</option>  
            <option value="OR">OR</option>  
          </select>  
          <select  
            value={filter.column}  
            onChange={(e) => handleFilterChange(index, 'column', e.target.value)}  
            style={{ marginRight: '10px' }}  
          >  
            <option value="name">Name</option>  
            <option value="age">Age</option>  
            <option value="country">Country</option>  
          </select>  
          <select  
            value={filter.operator}  
            onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}  
            style={{ marginRight: '10px' }}  
          >  
            <option value="contains">Contains</option>  
            <option value="equal">Equal</option>  
            <option value="greaterThan">Greater Than</option>  
          </select>  
          <input  
            type="text"  
            value={filter.value}  
            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}  
            placeholder="Filter value"  
          />  
        </div>  
      ))}  
      <button onClick={addFilterCondition}>Add Filter Condition</button>  

      <GridComponent dataSource={getFilteredData()} allowFiltering={false}>  
        <ColumnsDirective>  
          <ColumnDirective field='id' headerText='ID' width='100' textAlign='Center' />  
          <ColumnDirective field='name' headerText='Name' width='150' />  
          <ColumnDirective field='age' headerText='Age' width='100' textAlign='Right' />  
          <ColumnDirective field='country' headerText='Country' width='150' />  
        </ColumnsDirective>  
        <Inject services={[Filter]} />  
      </GridComponent>  
    </div>  
  );  
};  

// export default DynamicFilteringGrid1;