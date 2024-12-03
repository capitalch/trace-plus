import {
  Inject, Aggregate, Sort,
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  AggregatesDirective,
  AggregateDirective,
  AggregateColumnsDirective,
  AggregateColumnDirective,
} from "@syncfusion/ej2-react-treegrid";
import { useRef } from "react";
import { Decimal } from 'decimal.js'

export function SyncfusionTreeGrid() {

  const gridRef: any = useRef(null)
  return (
    <div className="m-2">
      <button className="my-2 px-2 bg-slate-200 py-1" onClick={handleOnClick}>Reset localstorage</button>
      <button className="ml-2 px-2 bg-slate-200 py-1" onClick={handleExpandAll}>Expand all</button>
      <TreeGridComponent
        allowSorting={true} // Enable sorting
        childMapping="children" // Field that indicates child data
        collapsed={onRowCollapsed}
        dataBound={onDataBound}
        dataSource={data3}
        enableCollapseAll={true}
        expanded={onRowExpanded}
        gridLines="Both"
        // height='100%'
        ref={gridRef}
        treeColumnIndex={0} // Specifies the index of the hierarchical column
      >
        <ColumnsDirective>
          <ColumnDirective field="accName" headerText="Acc Name" width="150" />
          <ColumnDirective field="opening" headerText="Opening" width="80" textAlign="Right" format="N2" />
          <ColumnDirective field="closing" headerText="Closing" width="80" />
          {/* <ColumnDirective field="id" headerText="Id" width="50"  isPrimaryKey={true} /> */}
        </ColumnsDirective>
        <AggregatesDirective>
          <AggregateDirective showChildSummary={false}>
            <AggregateColumnsDirective >
              <AggregateColumnDirective field="opening" type='Custom' format='N2' columnName="opening" customAggregate={customFn} footerTemplate={(props: any) => <span>{props.Custom}</span>} />
              <AggregateColumnDirective field="accName" type="Count" format='N2' footerTemplate={(props: any) => {
                const formattedValue = new Intl.NumberFormat('en-US').format(props.Count);
                return <span>{`Count: ${formattedValue}`}</span>;
              }}
              />
            </AggregateColumnsDirective>
          </AggregateDirective>
        </AggregatesDirective>

        <Inject services={[Aggregate, Sort]} />
      </TreeGridComponent>
    </div>
  );

  function customFn(data: any) {
    const res: any = data.result
      .filter((item: any) => !item.parentItem) // Filter only top-level rows
      .reduce((sum: Decimal, item: any) => sum.plus(item.opening || 0), new Decimal(0))
      .toNumber(); // Convert back to a native number if needed
    return (new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(res));
  }

  function handleExpandAll() {
    gridRef.current.expandAll()
  }

  function handleOnClick() {
    localStorage.setItem('expandedRows', '');
  }

  function onDataBound() {
    const expandedRows = localStorage.getItem('expandedRows') || ''
    const expandedKeys: any = expandedRows ? JSON.parse(expandedRows) || [] : [];
    expandedKeys.forEach((key: any) => {
      gridRef.current.expandByKey(key);
    });
  }

  function onRowCollapsed(args: any) {
    let expandedKeys = JSON.parse(localStorage.getItem('expandedRows') || '') || [];
    expandedKeys = expandedKeys.filter((key: any) => key !== args.data.key);
    localStorage.setItem('expandedRows', JSON.stringify(expandedKeys));
  }

  function onRowExpanded(args: any) {
    const expandedRows = localStorage.getItem('expandedRows') || ''
    const expandedKeys: any = expandedRows ? JSON.parse(expandedRows) || [] : [];
    if (!expandedKeys.includes(args.data.key)) {
      expandedKeys.push(args.data.key);
      localStorage.setItem('expandedRows', JSON.stringify(expandedKeys));
    }
  }
}

const data3 = [
  {
    "id": 15,
    "accName": "Current Assets",
    "accCode": "CurrentAssets",
    "accType": "A",
    "opening": 943337.02,
    "opening_dc": "D",
    "debit": 52901,
    "credit": 2000,
    "closing": 994238.02,
    "closing_dc": "D",
    "parentId": null,
    "children": [
      {
        "id": 16,
        "accName": "Bank Accounts",
        "accCode": "BankAccounts",
        "accType": "A",
        "opening": 845107.02,
        "opening_dc": "D",
        "debit": 47201,
        "credit": 2000,
        "closing": 890308.02,
        "closing_dc": "D",
        "parentId": 15,
        "children": [
          {
            "id": 117,
            "accName": "bank1",
            "accCode": "bank1",
            "accType": "A",
            "opening": 378762.02,
            "opening_dc": "D",
            "debit": 0,
            "credit": 2000,
            "closing": 376762.02,
            "closing_dc": "D",
            "parentId": 16,
            "children": [

            ]
          },
          {
            "id": 241,
            "accName": "bank10",
            "accCode": "bank10",
            "accType": "A",
            "opening": 2300,
            "opening_dc": "C",
            "debit": 0,
            "credit": 0,
            "closing": 2300,
            "closing_dc": "C",
            "parentId": 16,
            "children": [

            ]
          },
          {
            "id": 242,
            "accName": "bank12",
            "accCode": "bank12",
            "accType": "A",
            "opening": 45000,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 45000,
            "closing_dc": "D",
            "parentId": 16,
            "children": [

            ]
          },
          {
            "id": 233,
            "accName": "bank3",
            "accCode": "bank3",
            "accType": "A",
            "opening": 5000,
            "opening_dc": "D",
            "debit": 2200,
            "credit": 0,
            "closing": 7200,
            "closing_dc": "D",
            "parentId": 16,
            "children": [

            ]
          },
          {
            "id": 239,
            "accName": "bank8",
            "accCode": "bank8",
            "accType": "A",
            "opening": 53100,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 53100,
            "closing_dc": "D",
            "parentId": 16,
            "children": [

            ]
          },
          {
            "id": 331,
            "accName": "ICICI Bank Account 47400074 Goel Food",
            "accCode": "goelFood74",
            "accType": "A",
            "opening": 69000,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 69000,
            "closing_dc": "D",
            "parentId": 16,
            "children": [

            ]
          },
          {
            "id": 232,
            "accName": "ICICI Bank C/A 400000474",
            "accCode": "ICICI474",
            "accType": "A",
            "opening": 294445,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 294445,
            "closing_dc": "D",
            "parentId": 16,
            "children": [

            ]
          },
          {
            "id": 345,
            "accName": "Kolkata Bank",
            "accCode": "kolkataBank",
            "accType": "A",
            "opening": 2100,
            "opening_dc": "D",
            "debit": 45001,
            "credit": 0,
            "closing": 47101,
            "closing_dc": "D",
            "parentId": 16,
            "children": [

            ]
          }
        ]
      },
      {
        "id": 17,
        "accName": "Cash-in-Hand",
        "accCode": "CashInHand",
        "accType": "A",
        "opening": 60907,
        "opening_dc": "D",
        "debit": 3200,
        "credit": 0,
        "closing": 64107,
        "closing_dc": "D",
        "parentId": 15,
        "children": [
          {
            "id": 118,
            "accName": "cash1",
            "accCode": "cash1",
            "accType": "A",
            "opening": 60907,
            "opening_dc": "D",
            "debit": 3200,
            "credit": 0,
            "closing": 64107,
            "closing_dc": "D",
            "parentId": 17,
            "children": [

            ]
          }
        ]
      },
      {
        "id": 22,
        "accName": "Sundry Debtors",
        "accCode": "SundryDebtors",
        "accType": "A",
        "opening": 37323,
        "opening_dc": "D",
        "debit": 2500,
        "credit": 0,
        "closing": 39823,
        "closing_dc": "D",
        "parentId": 15,
        "children": [
          {
            "id": 177,
            "accName": "ABC limited",
            "accCode": "abclimited",
            "accType": "A",
            "opening": 2823,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 2823,
            "closing_dc": "D",
            "parentId": 22,
            "children": [

            ]
          },
          {
            "id": 311,
            "accName": "Bajaj Finance",
            "accCode": "bajajFinance",
            "accType": "A",
            "opening": 34500,
            "opening_dc": "D",
            "debit": 2500,
            "credit": 0,
            "closing": 37000,
            "closing_dc": "D",
            "parentId": 22,
            "children": [
              {
                "id": 347,
                "accName": "2024-05-26 H/SAL/4/2024: 311/H/1 abcd:3333333333",
                "accCode": "311/H/1/2024",
                "accType": "A",
                "opening": 0,
                "opening_dc": "D",
                "debit": 2500,
                "credit": 0,
                "closing": 2500,
                "closing_dc": "D",
                "parentId": 311,
                "children": [

                ]
              },
              {
                "id": 312,
                "accName": "311/head/1/2022",
                "accCode": "311/head/1/2022",
                "accType": "A",
                "opening": 11500,
                "opening_dc": "D",
                "debit": 0,
                "credit": 0,
                "closing": 11500,
                "closing_dc": "D",
                "parentId": 311,
                "children": [

                ]
              },
              {
                "id": 313,
                "accName": "311/head/2/2022",
                "accCode": "311/head/2/2022",
                "accType": "A",
                "opening": 11500,
                "opening_dc": "D",
                "debit": 0,
                "credit": 0,
                "closing": 11500,
                "closing_dc": "D",
                "parentId": 311,
                "children": [

                ]
              },
              {
                "id": 314,
                "accName": "311/head/3/2022",
                "accCode": "311/head/3/2022",
                "accType": "A",
                "opening": 11500,
                "opening_dc": "D",
                "debit": 0,
                "credit": 0,
                "closing": 11500,
                "closing_dc": "D",
                "parentId": 311,
                "children": [

                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 25,
    "accName": "Indirect Expences",
    "accCode": "IndirectExpences",
    "accType": "E",
    "opening": 0,
    "opening_dc": "D",
    "debit": 2000,
    "credit": 0,
    "closing": 2000,
    "closing_dc": "D",
    "parentId": null,
    "children": [
      {
        "id": 129,
        "accName": "Computer expenses",
        "accCode": "computerExpenses",
        "accType": "E",
        "opening": 0,
        "opening_dc": "D",
        "debit": 2000,
        "credit": 0,
        "closing": 2000,
        "closing_dc": "D",
        "parentId": 25,
        "children": [

        ]
      }
    ]
  },
  {
    "id": 26,
    "accName": "Purchase Accounts",
    "accCode": "Purchase",
    "accType": "E",
    "opening": 0,
    "opening_dc": "D",
    "debit": 226596,
    "credit": 0,
    "closing": 226596,
    "closing_dc": "D",
    "parentId": null,
    "children": [
      {
        "id": 168,
        "accName": "Purchase",
        "accCode": "purchase",
        "accType": "E",
        "opening": 0,
        "opening_dc": "D",
        "debit": 226596,
        "credit": 0,
        "closing": 226596,
        "closing_dc": "D",
        "parentId": 26,
        "children": [

        ]
      }
    ]
  },
  {
    "id": 30,
    "accName": "Sales Account",
    "accCode": "Sales",
    "accType": "I",
    "opening": 0,
    "opening_dc": "D",
    "debit": 0,
    "credit": 117901,
    "closing": 117901,
    "closing_dc": "C",
    "parentId": null,
    "children": [
      {
        "id": 167,
        "accName": "Sales",
        "accCode": "sales",
        "accType": "I",
        "opening": 0,
        "opening_dc": "D",
        "debit": 0,
        "credit": 117901,
        "closing": 117901,
        "closing_dc": "C",
        "parentId": 30,
        "children": [

        ]
      }
    ]
  },
  {
    "id": 2,
    "accName": "Capital Account",
    "accCode": "Capitalaccount",
    "accType": "L",
    "opening": 34525399.98,
    "opening_dc": "D",
    "debit": 0,
    "credit": 0,
    "closing": 34525399.98,
    "closing_dc": "D",
    "parentId": null,
    "children": [
      {
        "id": 3,
        "accName": "Capital Account Subgroup",
        "accCode": "CapitalSubgroup",
        "accType": "L",
        "opening": 34525399.98,
        "opening_dc": "D",
        "debit": 0,
        "credit": 0,
        "closing": 34525399.98,
        "closing_dc": "D",
        "parentId": 2,
        "children": [
          {
            "id": 4,
            "accName": "Capital",
            "accCode": "Capital",
            "accType": "L",
            "opening": 34525399.98,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 34525399.98,
            "closing_dc": "D",
            "parentId": 3,
            "children": [

            ]
          }
        ]
      }
    ]
  },
  {
    "id": 6,
    "accName": "Current Liabilities",
    "accCode": "CurrentLiabilities",
    "accType": "L",
    "opening": 35468737,
    "opening_dc": "C",
    "debit": 65000,
    "credit": 226596,
    "closing": 35630333,
    "closing_dc": "C",
    "parentId": null,
    "children": [
      {
        "id": 9,
        "accName": "Sundry Creditors",
        "accCode": "SundryCreditors",
        "accType": "L",
        "opening": 35468737,
        "opening_dc": "C",
        "debit": 65000,
        "credit": 226596,
        "closing": 35630333,
        "closing_dc": "C",
        "parentId": 6,
        "children": [
          {
            "id": 149,
            "accName": "Goods creditors",
            "accCode": "goodsCreditor",
            "accType": "L",
            "opening": 4623793,
            "opening_dc": "C",
            "debit": 65000,
            "credit": 226596,
            "closing": 4785389,
            "closing_dc": "C",
            "parentId": 9,
            "children": [
              {
                "id": 320,
                "accName": "Aar Enterprise Inc",
                "accCode": "aarEnterpriseInc",
                "accType": "L",
                "opening": 19000,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 19000,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 154,
                "accName": "ABM Sales pvt Ltd",
                "accCode": "abmSalesPvtLtd",
                "accType": "L",
                "opening": 0,
                "opening_dc": "D",
                "debit": 0,
                "credit": 5646,
                "closing": 5646,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 329,
                "accName": "Basant Time",
                "accCode": "basantTime",
                "accType": "L",
                "opening": 708,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 708,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 330,
                "accName": "Bharat Electronic Trading Corp.",
                "accCode": "bharatElectronicTradingCorp",
                "accType": "L",
                "opening": 13860,
                "opening_dc": "C",
                "debit": 65000,
                "credit": 0,
                "closing": 51140,
                "closing_dc": "D",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 325,
                "accName": "Bhatia Photo Industries P Ltd",
                "accCode": "bhatiaPhotoIndustriesPLtd",
                "accType": "L",
                "opening": 29943,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 29943,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 326,
                "accName": "Billenium Sales and Service P Ltd",
                "accCode": "billeniumSalesandServicePvtLtd",
                "accType": "L",
                "opening": 48660,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 48660,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 315,
                "accName": "Capital Photo Service P Ltd",
                "accCode": "capitalPhotoServicePLtd",
                "accType": "L",
                "opening": 4273118,
                "opening_dc": "C",
                "debit": 0,
                "credit": 50000,
                "closing": 4323118,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 319,
                "accName": "Ciel Sales Pvt Ltd",
                "accCode": "cielSalesPvtLtd",
                "accType": "L",
                "opening": 50501,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 50501,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 317,
                "accName": "Inter Foto India P Ltd",
                "accCode": "interfotoIndiaPvtLtd",
                "accType": "L",
                "opening": 180669,
                "opening_dc": "C",
                "debit": 0,
                "credit": 70800,
                "closing": 251469,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 328,
                "accName": "Sain Care",
                "accCode": "sainCare",
                "accType": "L",
                "opening": 1729,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 1729,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 174,
                "accName": "Sony India Pvt Ltd",
                "accCode": "SonyIndia",
                "accType": "L",
                "opening": 0,
                "opening_dc": "D",
                "debit": 0,
                "credit": 100150,
                "closing": 100150,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              },
              {
                "id": 327,
                "accName": "Subhra Enterprise",
                "accCode": "subhraEnterprise",
                "accType": "L",
                "opening": 5605,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 5605,
                "closing_dc": "C",
                "parentId": 149,
                "children": [

                ]
              }
            ]
          },
          {
            "id": 180,
            "accName": "Interfoto",
            "accCode": "interfoto",
            "accType": "L",
            "opening": 30688474,
            "opening_dc": "C",
            "debit": 0,
            "credit": 0,
            "closing": 30688474,
            "closing_dc": "C",
            "parentId": 9,
            "children": [

            ]
          },
          {
            "id": 318,
            "accName": "Inter FotoIndia",
            "accCode": "InterfotoIndia",
            "accType": "L",
            "opening": 158470,
            "opening_dc": "C",
            "debit": 0,
            "credit": 0,
            "closing": 158470,
            "closing_dc": "C",
            "parentId": 9,
            "children": [

            ]
          },
          {
            "id": 153,
            "accName": "Service creditors",
            "accCode": "serviceCreditors",
            "accType": "L",
            "opening": 2000,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 2000,
            "closing_dc": "D",
            "parentId": 9,
            "children": [
              {
                "id": 150,
                "accName": "ABC Service Pvt Ltd",
                "accCode": "abcServicePvtLtd",
                "accType": "L",
                "opening": 2000,
                "opening_dc": "D",
                "debit": 0,
                "credit": 0,
                "closing": 2000,
                "closing_dc": "D",
                "parentId": 153,
                "children": [

                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

/*
,
  {
    "id": 25,
    "accName": "Indirect Expences",
    "accCode": "IndirectExpences",
    "accType": "E",
    "opening": 0,
    "opening_dc": "D",
    "debit": 2000,
    "credit": 0,
    "closing": 2000,
    "closing_dc": "D",
    "parentId": null,
    "children": [
      {
        "id": 129,
        "accName": "Computer expenses",
        "accCode": "computerExpenses",
        "accType": "E",
        "opening": 0,
        "opening_dc": "D",
        "debit": 2000,
        "credit": 0,
        "closing": 2000,
        "closing_dc": "D",
        "parentId": 25,
        "children": [
          
        ]
      }
    ]
  },
  {
    "id": 26,
    "accName": "Purchase Accounts",
    "accCode": "Purchase",
    "accType": "E",
    "opening": 0,
    "opening_dc": "D",
    "debit": 226596,
    "credit": 0,
    "closing": 226596,
    "closing_dc": "D",
    "parentId": null,
    "children": [
      {
        "id": 168,
        "accName": "Purchase",
        "accCode": "purchase",
        "accType": "E",
        "opening": 0,
        "opening_dc": "D",
        "debit": 226596,
        "credit": 0,
        "closing": 226596,
        "closing_dc": "D",
        "parentId": 26,
        "children": [
          
        ]
      }
    ]
  },
  {
    "id": 30,
    "accName": "Sales Account",
    "accCode": "Sales",
    "accType": "I",
    "opening": 0,
    "opening_dc": "D",
    "debit": 0,
    "credit": 117901,
    "closing": 117901,
    "closing_dc": "C",
    "parentId": null,
    "children": [
      {
        "id": 167,
        "accName": "Sales",
        "accCode": "sales",
        "accType": "I",
        "opening": 0,
        "opening_dc": "D",
        "debit": 0,
        "credit": 117901,
        "closing": 117901,
        "closing_dc": "C",
        "parentId": 30,
        "children": [
          
        ]
      }
    ]
  },
  {
    "id": 2,
    "accName": "Capital Account",
    "accCode": "Capitalaccount",
    "accType": "L",
    "opening": 34525399.98,
    "opening_dc": "D",
    "debit": 0,
    "credit": 0,
    "closing": 34525399.98,
    "closing_dc": "D",
    "parentId": null,
    "children": [
      {
        "id": 3,
        "accName": "Capital Account Subgroup",
        "accCode": "CapitalSubgroup",
        "accType": "L",
        "opening": 34525399.98,
        "opening_dc": "D",
        "debit": 0,
        "credit": 0,
        "closing": 34525399.98,
        "closing_dc": "D",
        "parentId": 2,
        "children": [
          {
            "id": 4,
            "accName": "Capital",
            "accCode": "Capital",
            "accType": "L",
            "opening": 34525399.98,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 34525399.98,
            "closing_dc": "D",
            "parentId": 3,
            "children": [
              
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 6,
    "accName": "Current Liabilities",
    "accCode": "CurrentLiabilities",
    "accType": "L",
    "opening": 35468737,
    "opening_dc": "C",
    "debit": 65000,
    "credit": 226596,
    "closing": 35630333,
    "closing_dc": "C",
    "parentId": null,
    "children": [
      {
        "id": 9,
        "accName": "Sundry Creditors",
        "accCode": "SundryCreditors",
        "accType": "L",
        "opening": 35468737,
        "opening_dc": "C",
        "debit": 65000,
        "credit": 226596,
        "closing": 35630333,
        "closing_dc": "C",
        "parentId": 6,
        "children": [
          {
            "id": 149,
            "accName": "Goods creditors",
            "accCode": "goodsCreditor",
            "accType": "L",
            "opening": 4623793,
            "opening_dc": "C",
            "debit": 65000,
            "credit": 226596,
            "closing": 4785389,
            "closing_dc": "C",
            "parentId": 9,
            "children": [
              {
                "id": 320,
                "accName": "Aar Enterprise Inc",
                "accCode": "aarEnterpriseInc",
                "accType": "L",
                "opening": 19000,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 19000,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 154,
                "accName": "ABM Sales pvt Ltd",
                "accCode": "abmSalesPvtLtd",
                "accType": "L",
                "opening": 0,
                "opening_dc": "D",
                "debit": 0,
                "credit": 5646,
                "closing": 5646,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 329,
                "accName": "Basant Time",
                "accCode": "basantTime",
                "accType": "L",
                "opening": 708,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 708,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 330,
                "accName": "Bharat Electronic Trading Corp.",
                "accCode": "bharatElectronicTradingCorp",
                "accType": "L",
                "opening": 13860,
                "opening_dc": "C",
                "debit": 65000,
                "credit": 0,
                "closing": 51140,
                "closing_dc": "D",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 325,
                "accName": "Bhatia Photo Industries P Ltd",
                "accCode": "bhatiaPhotoIndustriesPLtd",
                "accType": "L",
                "opening": 29943,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 29943,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 326,
                "accName": "Billenium Sales and Service P Ltd",
                "accCode": "billeniumSalesandServicePvtLtd",
                "accType": "L",
                "opening": 48660,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 48660,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 315,
                "accName": "Capital Photo Service P Ltd",
                "accCode": "capitalPhotoServicePLtd",
                "accType": "L",
                "opening": 4273118,
                "opening_dc": "C",
                "debit": 0,
                "credit": 50000,
                "closing": 4323118,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 319,
                "accName": "Ciel Sales Pvt Ltd",
                "accCode": "cielSalesPvtLtd",
                "accType": "L",
                "opening": 50501,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 50501,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 317,
                "accName": "Inter Foto India P Ltd",
                "accCode": "interfotoIndiaPvtLtd",
                "accType": "L",
                "opening": 180669,
                "opening_dc": "C",
                "debit": 0,
                "credit": 70800,
                "closing": 251469,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 328,
                "accName": "Sain Care",
                "accCode": "sainCare",
                "accType": "L",
                "opening": 1729,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 1729,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 174,
                "accName": "Sony India Pvt Ltd",
                "accCode": "SonyIndia",
                "accType": "L",
                "opening": 0,
                "opening_dc": "D",
                "debit": 0,
                "credit": 100150,
                "closing": 100150,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              },
              {
                "id": 327,
                "accName": "Subhra Enterprise",
                "accCode": "subhraEnterprise",
                "accType": "L",
                "opening": 5605,
                "opening_dc": "C",
                "debit": 0,
                "credit": 0,
                "closing": 5605,
                "closing_dc": "C",
                "parentId": 149,
                "children": [
                  
                ]
              }
            ]
          },
          {
            "id": 180,
            "accName": "Interfoto",
            "accCode": "interfoto",
            "accType": "L",
            "opening": 30688474,
            "opening_dc": "C",
            "debit": 0,
            "credit": 0,
            "closing": 30688474,
            "closing_dc": "C",
            "parentId": 9,
            "children": [
              
            ]
          },
          {
            "id": 318,
            "accName": "Inter FotoIndia",
            "accCode": "InterfotoIndia",
            "accType": "L",
            "opening": 158470,
            "opening_dc": "C",
            "debit": 0,
            "credit": 0,
            "closing": 158470,
            "closing_dc": "C",
            "parentId": 9,
            "children": [
              
            ]
          },
          {
            "id": 153,
            "accName": "Service creditors",
            "accCode": "serviceCreditors",
            "accType": "L",
            "opening": 2000,
            "opening_dc": "D",
            "debit": 0,
            "credit": 0,
            "closing": 2000,
            "closing_dc": "D",
            "parentId": 9,
            "children": [
              {
                "id": 150,
                "accName": "ABC Service Pvt Ltd",
                "accCode": "abcServicePvtLtd",
                "accType": "L",
                "opening": 2000,
                "opening_dc": "D",
                "debit": 0,
                "credit": 0,
                "closing": 2000,
                "closing_dc": "D",
                "parentId": 153,
                "children": [
                  
                ]
              }
            ]
          }
        ]
      }
    ]
  }
*/