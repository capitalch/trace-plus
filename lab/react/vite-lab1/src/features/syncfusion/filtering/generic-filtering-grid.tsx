// src/GenericFilteringGrid.tsx  
import React, { useState } from 'react';  
import {  
  GridComponent,  
  ColumnsDirective,  
  ColumnDirective,  
  Inject,  
  Filter,  
} from '@syncfusion/ej2-react-grids';  

interface DataItem {  
  [key: string]: any;  
}  

interface FilterCondition {  
  logicalOperator?: string;  
  column: string;  
  operator: string;  
  value: string;  
}  

interface GenericFilteringGridProps {  
  data: DataItem[];  
  columns: { field: string; headerText: string; width?: string }[];  
}  

export const GenericFilteringGrid: React.FC<GenericFilteringGridProps> = ({ data, columns }) => {  
  const [filters, setFilters] = useState<FilterCondition[]>([  
    { logicalOperator: 'AND', column: columns[0].field, operator: 'contains', value: '' },  
  ]);  

  const addFilterCondition = () => {  
    setFilters([...filters, { logicalOperator: 'AND', column: columns[0].field, operator: 'contains', value: '' }]);  
  };  

  const handleFilterChange = (index: number, field: string, value: string) => {  
    const updatedFilters = filters.map((filter, i) =>  
      i === index ? { ...filter, [field]: value } : filter  
    );  
    setFilters(updatedFilters);  
  };  

  const getFilteredData = () => {  
    return data.filter((item) => {  
      return filters.reduce((accumulator, filter, index) => {  
        const { column, operator, value, logicalOperator } = filter;  
        const currentCondition = (() => {  
          if (operator === 'contains') {  
            return item[column].toString().toLowerCase().includes(value.toLowerCase());  
          } else if (operator === 'equal') {  
            return item[column] === value;  
          } else if (operator === 'greaterThan') {  
            return item[column] > parseInt(value, 10);  
          }  
          return true;  
        })();  

        if (index === 0) {  
          return currentCondition; // First condition  
        }  
        return logicalOperator === 'AND' ? accumulator && currentCondition : accumulator || currentCondition;  
      }, true);  
    });  
  };  

  return (  
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg">  
      <h3 className="text-xl font-semibold mb-4">Dynamic Multi-Column Filtering</h3>  
      {filters.map((filter, index) => (  
        <div key={index} className="flex items-center mb-3 p-2 border border-gray-300 rounded-md bg-white">  
          <select  
            className="p-2 border border-gray-300 rounded-md mr-2"  
            value={filter.logicalOperator}  
            onChange={(e) => handleFilterChange(index, 'logicalOperator', e.target.value)}  
          >  
            <option value="AND">AND</option>  
            <option value="OR">OR</option>  
          </select>  
          <select  
            className="p-2 border border-gray-300 rounded-md mr-2"  
            value={filter.column}  
            onChange={(e) => handleFilterChange(index, 'column', e.target.value)}  
          >  
            {columns.map((col, colIndex) => (  
              <option key={colIndex} value={col.field}>  
                {col.headerText}  
              </option>  
            ))}  
          </select>  
          <select  
            className="p-2 border border-gray-300 rounded-md mr-2"  
            value={filter.operator}  
            onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}  
          >  
            <option value="contains">Contains</option>  
            <option value="equal">Equal</option>  
            <option value="greaterThan">Greater Than</option>  
          </select>  
          <input  
            type="text"  
            className="p-2 border border-gray-300 rounded-md mr-2 flex-grow"  
            value={filter.value}  
            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}  
            placeholder="Filter value"  
          />  
        </div>  
      ))}  
      <button onClick={addFilterCondition} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">  
        Add Filter Condition  
      </button>  

      <GridComponent dataSource={getFilteredData()} allowFiltering={false}>  
        <ColumnsDirective>  
          {columns.map((col, index) => (  
            <ColumnDirective key={index} field={col.field} headerText={col.headerText} width={col.width} />  
          ))}  
        </ColumnsDirective>  
        <Inject services={[Filter]} />  
      </GridComponent>  
    </div>  
  );  
};  

// export default GenericFilteringGrid;