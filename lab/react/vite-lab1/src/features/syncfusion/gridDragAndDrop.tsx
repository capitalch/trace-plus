import { ColumnDirective, ColumnsDirective, GridComponent, Inject, RowDD, RowDropSettingsModel } from "@syncfusion/ej2-react-grids";
import { useEffect, useRef, useState } from "react";


export function GridDragAndDrop() {
    const gridRef: any = useRef(null)

    const rowDropOptions: RowDropSettingsModel = { targetID: 'AAA' }
    // const [data, setData]:any[] = useState([])
    useEffect(() => {
        const gridElement = gridRef.current.element.querySelector('.e-content');
        // Add scroll event listener
        if (gridElement) {
            gridElement.addEventListener('scroll', handleScroll);
        }
        // Cleanup function to remove the event listener
        return () => {
            if (gridElement) {
                gridElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="flex">
            {/* <button onClick={handleRefresh}>Refresh</button> */}
            <GridComponent
                ref={gridRef}
                dataSource={gridData}
                allowRowDragAndDrop={true} // Enable row drag-and-drop
                // rowDropSettings={rowDropOptions}
                rowDrop={onRowDrop1}
                height={400}>
                <ColumnsDirective>
                    <ColumnDirective field='OrderID' headerText='Order ID' width='120' textAlign='Right' />
                    <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
                    <ColumnDirective field='Freight' headerText='Freight' width='120' textAlign='Right' />
                </ColumnsDirective>
                <Inject services={[RowDD]} />
            </GridComponent>

            <GridComponent
                ref={gridRef}
                dataSource={gridData}
                allowRowDragAndDrop={true} // Enable row drag-and-drop
                // id='AAA'
                rowDrop={onRowDrop2}
                height={400}>
                <ColumnsDirective>
                    <ColumnDirective field='OrderID' headerText='Order ID' width='120' textAlign='Right' />
                    <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
                    <ColumnDirective field='Freight' headerText='Freight' width='120' textAlign='Right' />
                </ColumnsDirective>
                <Inject services={[RowDD]} />
            </GridComponent>
        </div>)

    function handleScroll(e: any) {
        const scrollTop = e.target.scrollTop; // Vertical scroll 
        console.log(scrollTop)
    }

    function onRowDrop2(e:any){
        console.log(e)
    }

    function onRowDrop1(e:any){
        console.log(e)
    }

    // function handleRefresh() {
    //     setData([...gridData])
    // }
}

const gridData = [
    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 },
    { OrderID: 10251, CustomerID: 'LILAS', Freight: 41.34 },
    { OrderID: 10252, CustomerID: 'HUNGO', Freight: 25.00 },

    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 },
    { OrderID: 10251, CustomerID: 'LILAS', Freight: 41.34 },
    { OrderID: 10252, CustomerID: 'HUNGO', Freight: 25.00 },

    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 },
    { OrderID: 10251, CustomerID: 'LILAS', Freight: 41.34 },
    { OrderID: 10252, CustomerID: 'HUNGO', Freight: 25.00 },

    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 },
    { OrderID: 10251, CustomerID: 'LILAS', Freight: 41.34 },
    { OrderID: 10252, CustomerID: 'HUNGO', Freight: 25.00 },
    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 },
    { OrderID: 10251, CustomerID: 'LILAS', Freight: 41.34 },
    { OrderID: 10252, CustomerID: 'HUNGO', Freight: 25.00 }
];