import {
  Inject, Aggregate, Sort,
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  // AggregatesDirective,
  // AggregateDirective,
  // AggregateColumnsDirective,
  // AggregateColumnDirective,
  Edit,
} from "@syncfusion/ej2-react-treegrid";
import { useEffect, useRef } from "react";
import { data1 } from './test-data1'
import _ from "lodash";

export function SyncfusionTreeGrid() {
  const gridRef: any = useRef(null)
  // const [, setRefresh] = useState({})
  const editSettings = {
    allowEditing: true,
    mode: 'Cell'
  }

  const meta: any = useRef({
    rows: [],
    flatData: {}
  })

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="m-2">
      {/* <button className="my-2 px-2 bg-slate-200 py-1" onClick={handleOnClick}>Reset localstorage</button> */}
      <div className="flex gap-4 py-2">
        <button className="bg-slate-200 px-2 py-1 rounded-md" onClick={checkData}>Check</button>
        <button className="bg-slate-200 px-2 py-1 rounded-md" onClick={handleExpandAll}>Expand</button>
        <button className="ml-2 px-2 bg-slate-200 py-1 rounded-md" onClick={loadData}>Refresh</button>
      </div>
      <TreeGridComponent
        actionComplete={onActionComplete}
        allowSorting={true} // Enable sorting
        cellEdit={onCellEdit}
        childMapping="children" // Field that indicates child data
        // collapsed={onRowCollapsed}
        // dataBound={onDataBound}
        dataSource={meta.current.rows}
        editSettings={editSettings}
        enableCollapseAll={undefined}
        // expanded={onRowExpanded}
        gridLines="Both"
        // height='100%'
        queryCellInfo={onQueryCellInfo}
        ref={gridRef}
        // rowDataBound={onRowDataBound}
        treeColumnIndex={0} // Specifies the index of the hierarchical column
      >
        <ColumnsDirective>
          <ColumnDirective field="accName" allowEditing={false} headerText="Acc Name" width="150" />
          <ColumnDirective field="id" isPrimaryKey={true} width={20} visible={false} />
          <ColumnDirective
            allowEditing={true}
            edit={{
              params:
              {
                decimals: 2,
                format: 'N2',
                showSpinButton: false,
                validateDecimalOnType: true
              }
            }}
            editType="numericedit"
            field="debit"
            headerText="Debits"
            width="80"
            textAlign="Right"
            type="number"
            format="N2" />
          <ColumnDirective
            allowEditing={true}
            edit={{
              params:
              {
                decimals: 2,
                format: 'N2',
                showSpinButton: false,
                validateDecimalOnType: true
              }
            }}
            editType="numericedit"
            field="credit"
            headerText="Credits"
            width="80"
            textAlign="Right"
            type="number"
            format="N2" />
          <ColumnDirective field="accLeaf" headerText="Level" width='40' />
        </ColumnsDirective>
        <Inject services={[Aggregate, Edit, Sort]} />
      </TreeGridComponent>
    </div>
  );

  function checkData() {
    console.log(meta.current.rows)
  }

  function flattenData(items: any[]) {
    items.forEach((item: any) => {
      meta.current.flatData[item.id] = item
      if (item.children && item.children.length > 0) {
        flattenData(item.children)
      }
    })
  }

  function updateParentRecursive(id: string, value: number, prevValue: number, field: string) {
    const fd: any = meta.current.flatData
    const parentId = fd[id].parentId
    if (parentId) {
      fd[parentId][field] += (value - prevValue)
      updateParentRecursive(parentId, value, prevValue, field)
    }
  }

  function handleExpandAll() {
    gridRef.current.expandAll()
  }

  function loadData() {
    meta.current.rows = data1
    sumDebitCredit()
    flattenData(meta.current.rows)
  }

  function onActionComplete(args: any) {
    if (args.type === 'save') {
      meta.current.flatData[args.data.id].isValueChanged = true
      updateParentRecursive(args.data.id, args.data[args.column.field], args.previousData, args.column.field)
      gridRef.current.endEdit()
      gridRef.current.refresh()
    }
  }

  function onQueryCellInfo(args: any) {
    if (['debit', 'credit'].includes(args.column.field)) {
      if (args.data.isValueChanged) {
        args.cell.style.backgroundColor = 'lightgreen';
      }
    }
  }

  function onCellEdit(args: any) {
    if (!['S', 'Y'].includes(args.rowData.accLeaf)) {
      args.cancel = true
      return
    }
    if (!['debit', 'credit'].includes(args.columnName)) {
      args.cancel = true
      return
    }
    setTimeout(() => {
      if (['debit', 'credit'].includes(args.columnName)) {
        const inputElement = args.row.querySelector('input');
        if (inputElement) {
          inputElement.value = parseFloat(inputElement.value).toFixed(2);
          inputElement.focus();
          inputElement.select();  // Select all text
        }
      }
    }, 50);
  }

  function sumDebitCredit() {
    const nodes: any[] = meta.current.rows

    function calculateTotals(node: any) {
      if (!node.children || node.children.length === 0) {
        return { debit: node.debit, credit: node.credit };
      }
      let totalDebit = node.debit;
      let totalCredit = node.credit;

      node.children.forEach((child: any) => {
        const childTotals = calculateTotals(child);
        totalDebit += childTotals.debit;
        totalCredit += childTotals.credit;
      });

      node.debit = totalDebit;
      node.credit = totalCredit;

      return { debit: totalDebit, credit: totalCredit };
    }

    nodes.forEach((node: any) => calculateTotals(node));
    if (gridRef) {
      gridRef.current.dataSource = nodes // structuredClone(nodes)
      gridRef.current.endEdit()
      gridRef.current.refresh()
      // gridRef.current.refreshColumns()
    }
  }
}

{/* <AggregatesDirective>
          <AggregateDirective showChildSummary={false}>
            <AggregateColumnsDirective >
              <AggregateColumnDirective
                field="opening"
                type='Custom'
                format='N2'
                columnName="opening"
                customAggregate={customFn}
                footerTemplate={(props: any) => <span>{props.Custom}</span>} />
              <AggregateColumnDirective
                field="accName"
                type="Count"
                format='N2'
                footerTemplate={(props: any) => {
                  const formattedValue = new Intl.NumberFormat('en-US').format(props.Count);
                  return <span>{`Count: ${formattedValue}`}</span>;
                }}
              />
            </AggregateColumnsDirective>
          </AggregateDirective>
        </AggregatesDirective> */}

// function customFn(data: any) {
//   const res: any = data.result
//     .filter((item: any) => !item.parentItem) // Filter only top-level rows
//     .reduce((sum: Decimal, item: any) => sum.plus(item.opening || 0), new Decimal(0))
//     .toNumber(); // Convert back to a native number if needed
//   return (new Intl.NumberFormat('en-US', {
//     style: 'decimal',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(res));
// }

// function handleOnClick() {
//   localStorage.setItem('expandedRows', '');
// }

// function onDataBound() {
//   const expandedRows = localStorage.getItem('expandedRows') || ''
//   const expandedKeys: any = expandedRows ? JSON.parse(expandedRows) || [] : [];
//   expandedKeys.forEach((key: any) => {
//     gridRef.current.expandByKey(key);
//   });
// }

// function onRowCollapsed(args: any) {
//   let expandedKeys = JSON.parse(localStorage.getItem('expandedRows') || '') || [];
//   expandedKeys = expandedKeys.filter((key: any) => key !== args.data.key);
//   localStorage.setItem('expandedRows', JSON.stringify(expandedKeys));
// }

//   function onRowExpanded(args: any) {
//     const expandedRows = localStorage.getItem('expandedRows') || ''
//     const expandedKeys: any = expandedRows ? JSON.parse(expandedRows) || [] : [];
//     if (!expandedKeys.includes(args.data.key)) {
//       expandedKeys.push(args.data.key);
//       localStorage.setItem('expandedRows', JSON.stringify(expandedKeys));
//     }
//   }
// }

// const data1 = [
//   {
//     "id": 15,
//     "accName": "Current Assets",
//     "accCode": "CurrentAssets",
//     "accType": "A",
//     "opening": 943337.02,
//     "opening_dc": "D",
//     "debit": 52901,
//     "credit": 2000,
//     "closing": 994238.02,
//     "closing_dc": "D",
//     "children": [
//       {
//         "id": 16,
//         "accName": "Bank Accounts",
//         "accCode": "BankAccounts",
//         "accType": "A",
//         "opening": 845107.02,
//         "opening_dc": "D",
//         "debit": 47201,
//         "credit": 2000,
//         "closing": 890308.02,
//         "closing_dc": "D",
//         "parentId": 15,
//         "children": [
//           {
//             "id": 117,
//             "accName": "bank1",
//             "accCode": "bank1",
//             "accType": "A",
//             "opening": 378762.02,
//             "opening_dc": "D",
//             "debit": 0,
//             "credit": 2000,
//             "closing": 376762.02,
//             "closing_dc": "D",
//             "parentId": 16,
//           },
//         ]
//       },
//     ]
//   },
// ]
