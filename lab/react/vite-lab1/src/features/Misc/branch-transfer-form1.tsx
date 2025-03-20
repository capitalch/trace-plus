import { useForm, useFieldArray } from "react-hook-form";
// import { useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa";

type ProductLine = {
    productId: string;
    productCode: string;
    productDetails: string;
    refNo: string;
    qty: number;
    price: number;
    amount: number;
    lineRemarks: string;
    serialNo: string;
};

type FormData = {
    tranDate: string;
    userRefNo: string;
    remarks: string;
    sourceBranch: string;
    destBranch: string;
    productLines: ProductLine[];
};

export default function BranchTransferForm1() {
    const { register, control, setValue, watch } = useForm<FormData>({
        defaultValues: {
            tranDate: "",
            userRefNo: "",
            remarks: "",
            sourceBranch: "",
            destBranch: "",
            productLines: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "productLines",
    });

    const handleProductSearch = (index: number) => {
        // Open AsyncFusion Grid here and set productId + productDetails on selection
        console.log("Open product selection grid for row:", index);
      };

      return (
        <div className="p-4 space-y-4">
          {/* Header Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <input type="date" {...register("tranDate")} className="border p-2 rounded" />
            <input type="text" {...register("userRefNo")} placeholder="User Ref No" className="border p-2 rounded" />
            <textarea {...register("remarks")} placeholder="Remarks" className="border p-2 rounded col-span-2" />
            <input type="text" {...register("sourceBranch")} placeholder="Source Branch" className="border p-2 rounded" />
            <input type="text" {...register("destBranch")} placeholder="Destination Branch" className="border p-2 rounded" />
          </div>
    
          {/* Product Line Items Table */}
          <div className="border p-4 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Product Code</th>
                  <th className="p-2 border">Product Details</th>
                  <th className="p-2 border">Ref No</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Line Remarks</th>
                  <th className="p-2 border">Serial No</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((item, index) => {
                  const qty = watch(`productLines.${index}.qty`);
                  const price = watch(`productLines.${index}.price`);
                  const amount = qty * price;
                  setValue(`productLines.${index}.amount`, amount);
    
                  return (
                    <tr key={item.id} className="border">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border flex items-center">
                        <input
                          type="text"
                          {...register(`productLines.${index}.productCode`)}
                          className="border p-2 rounded w-full"
                        />
                        <button type="button" onClick={() => handleProductSearch(index)} className="ml-2 text-blue-500">
                          <FaSearch />
                        </button>
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          {...register(`productLines.${index}.productDetails`)}
                          className="border p-2 rounded w-full bg-gray-100"
                          readOnly
                        />
                      </td>
                      <td className="p-2 border">
                        <input type="text" {...register(`productLines.${index}.refNo`)} className="border p-2 rounded w-full" />
                      </td>
                      <td className="p-2 border">
                        <input type="number" {...register(`productLines.${index}.qty`)} className="border p-2 rounded w-full" />
                      </td>
                      <td className="p-2 border">
                        <input type="number" {...register(`productLines.${index}.price`)} className="border p-2 rounded w-full" />
                      </td>
                      <td className="p-2 border">
                        <input type="number" {...register(`productLines.${index}.amount`)} className="border p-2 rounded w-full bg-gray-100" readOnly />
                      </td>
                      <td className="p-2 border">
                        <input type="text" {...register(`productLines.${index}.lineRemarks`)} className="border p-2 rounded w-full" />
                      </td>
                      <td className="p-2 border">
                        <input type="text" {...register(`productLines.${index}.serialNo`)} className="border p-2 rounded w-full" />
                      </td>
                      <td className="p-2 border">
                        <button type="button" onClick={() => remove(index)} className="text-red-500">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
    
            <button type="button" onClick={() => append({ productId: "", productCode: "", productDetails: "", refNo: "", qty: 1, price: 0, amount: 0, lineRemarks: "", serialNo: "" })} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Add Product Line
            </button>
          </div>
        </div>
      );

}