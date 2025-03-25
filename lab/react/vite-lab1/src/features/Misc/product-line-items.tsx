import clsx from "clsx";
import { useFieldArray, useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";

export function ProductLineItems() {
    const { control, watch, register, setValue, formState: { errors } } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "productLineItems",
    });

    return (
        <table>
            <thead>
                <tr>
                    <th>Product Code</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {fields.map((item, index) => {
                    const qty = watch(`productLineItems.${index}.qty`);
                    return <tr key={item.id}>
                        <td>
                            <input
                                {...register(`productLineItems.${index}.productCode`)}
                                type="text"
                                className="form-control"
                            />
                        </td>
                        <td className="p-2 border relative">
                            <NumericFormat
                                allowNegative={false}
                                decimalScale={2}
                                defaultValue={0}
                                fixedDecimalScale={true}
                                {...register(`productLineItems.${index}.qty`, {
                                    validate: (value) =>
                                        value !== 0 || 'Qty cannot be zero'
                                })}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                onValueChange={(values) =>
                                    setValue(
                                        `productLineItems.${index}.qty`,
                                        values.floatValue ?? 0,
                                        { shouldValidate: true, shouldDirty: true }
                                    )
                                }
                                thousandSeparator={true}
                                value={watch(`productLineItems.${index}.qty`)}
                                className={clsx(
                                    "border p-2 rounded w-full text-right",
                                    qty === 0 ? "border-red-500 bg-red-100" : ""
                                )}
                            />
                        </td>
                        <td>
                            <button type="button" onClick={() => remove(index)}>
                                Remove
                            </button>
                        </td>
                    </tr>
                })}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={3}>
                        <button
                            type="button"
                            onClick={() =>
                                append({
                                    productCode: "",
                                    qty: 1,
                                    price: 0,
                                    lineRemarks: "",
                                    serialNumbers: "",
                                })
                            }
                        >
                            Add Product
                        </button>
                    </td>
                </tr>
            </tfoot>
        </table>);
}