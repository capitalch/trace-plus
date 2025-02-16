// import React from 'react';  
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Filter } from '@syncfusion/ej2-react-grids';  

export const DynamicBuiltinGrid = ({ data, columns }: any) => {  
  return (  
    <GridComponent dataSource={data} allowFiltering={true}>  
      <ColumnsDirective>  
        {columns.map((col: any, index: number)  => (  
          <ColumnDirective key={index} field={col.field} headerText={col.headerText} width={col.width} allowFiltering={true} />  
        ))}  
      </ColumnsDirective>  
      <Inject services={[Filter]} />  
    </GridComponent>  
  );  
};  

// export default SampleGrid;