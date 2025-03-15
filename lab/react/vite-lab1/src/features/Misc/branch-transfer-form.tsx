import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { GridComponent, ColumnsDirective, ColumnDirective } from "@syncfusion/ej2-react-grids";


const BranchTransfer = () => {
  const [activeTab, setActiveTab] = useState(0);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      productLineItems: [{ productCode: "", productDetails: "", refNo: "", qty: 0, price: 0, lineRemarks: "", serialNo: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "productLineItems" });

  const onSubmit = (data) => {
    console.log("Submitted Data:", data);
  };

  const columns = [
    { field: "date", headerText: "Date", width: "120" },
    { field: "autoRefNo", headerText: "Auto Ref No", width: "120" },
    { field: "sourceBranch", headerText: "Source Branch", width: "150" },
    { field: "destBranch", headerText: "Dest Branch", width: "150" },
    { field: "userRefNo", headerText: "User Ref No", width: "150" },
    { field: "productDetails", headerText: "Product Details", width: "200" },
    { field: "serialNo", headerText: "Serial No", width: "150" },
    { field: "productCodes", headerText: "Product Codes", width: "150" },
    { field: "amount", headerText: "Amount", width: "120" },
    { field: "remarks", headerText: "Remarks", width: "200" },
    { field: "lineRemarks", headerText: "Line Remarks", width: "200" },
    { field: "actions", headerText: "Actions", width: "150", template: () => <button className="text-blue-500">Edit</button> }
  ];

  return (
    <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
      <TabList>
        <Tab>View</Tab>
        <Tab>Data Entry</Tab>
      </TabList>

      <TabPanel>
        <GridComponent dataSource={[]} allowPaging={true} allowSorting={true}>
          <ColumnsDirective>
            {columns.map((col, idx) => <ColumnDirective key={idx} {...col} />)}
          </ColumnsDirective>
        </GridComponent>
      </TabPanel>

      <TabPanel>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white shadow rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Transaction Date</label>
              <input type="date" {...register("tranDate", { required: "Required" })} className="border rounded-md p-2 w-full" />
            </div>

            <div>
              <label>User Ref No</label>
              <input {...register("userRefNo")} className="border rounded-md p-2 w-full" />
            </div>
            
            <div>
              <label>Source Branch</label>
              <input {...register("sourceBranch", { required: "Required" })} className="border rounded-md p-2 w-full" />
            </div>

            <div>
              <label>Dest Branch</label>
              <input {...register("destBranch", { required: "Required" })} className="border rounded-md p-2 w-full" />
            </div>

            <div className="col-span-2">
              <label>Remarks</label>
              <input {...register("remarks")} className="border rounded-md p-2 w-full" />
            </div>
          </div>

          <h3 className="mt-4 font-semibold">Product Line Items</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-7 gap-2 items-end border-b pb-2 mb-2">
              <input {...register(`productLineItems.${index}.productCode`)} placeholder="Product Code" className="border rounded-md p-2" />
              <input {...register(`productLineItems.${index}.productDetails`)} placeholder="Product Details" className="border rounded-md p-2" />
              <input {...register(`productLineItems.${index}.refNo`)} placeholder="Ref No" className="border rounded-md p-2" />
              <input type="number" {...register(`productLineItems.${index}.qty`)} placeholder="Qty" className="border rounded-md p-2" />
              <input type="number" {...register(`productLineItems.${index}.price`)} placeholder="Price" className="border rounded-md p-2" />
              <input {...register(`productLineItems.${index}.lineRemarks`)} placeholder="Line Remarks" className="border rounded-md p-2" />
              <input {...register(`productLineItems.${index}.serialNo`)} placeholder="Serial No" className="border rounded-md p-2" />
              <button type="button" onClick={() => remove(index)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => append({ productCode: "", productDetails: "", refNo: "", qty: 0, price: 0, lineRemarks: "", serialNo: "" })} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Add Product
          </button>

          <button type="submit" className="w-full mt-4 bg-green-500 text-white px-4 py-2 rounded-md">Submit</button>
        </form>
      </TabPanel>
    </Tabs>
  );
};

export default BranchTransfer;
