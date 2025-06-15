import { useFieldArray, useForm } from "react-hook-form";

export function OrderForm() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            items: [{ productName: "", quantity: 1, price: 0 }],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });
    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-6">Order Form</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="grid grid-cols-12 gap-4 items-end border p-4 rounded-md"
                    >
                        <div className="col-span-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Name
                            </label>
                            <input
                                {...register(`items.${index}.productName`, {
                                    required: "Required",
                                })}
                                className="mt-1 block w-full border rounded p-2"
                            />
                            {errors.items?.[index]?.productName && (
                                <p className="text-sm text-red-500">
                                    {errors.items[index].productName?.message}
                                </p>
                            )}
                        </div>

                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <input
                                type="number"
                                {...register(`items.${index}.quantity`, {
                                    required: "Required",
                                    min: 1,
                                })}
                                className="mt-1 block w-full border rounded p-2"
                            />
                            {errors.items?.[index]?.quantity && (
                                <p className="text-sm text-red-500">
                                    {errors.items[index].quantity?.message}
                                </p>
                            )}
                        </div>

                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Price
                            </label>
                            <input
                                type="number"
                                {...register(`items.${index}.price`, {
                                    required: "Required",
                                    min: 0,
                                })}
                                className="mt-1 block w-full border rounded p-2"
                            />
                            {errors.items?.[index]?.price && (
                                <p className="text-sm text-red-500">
                                    {errors.items[index].price?.message}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2 text-right">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                ✕ Remove
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button"
                        onClick={() => append({ productName: "", quantity: 1, price: 0 })}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        + Add Item
                    </button>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Submit Order
                    </button>
                </div>
            </form>
        </div>
    )

    function onSubmit(data: FormValues) {
        console.log(data)
    }
}

type Item = {
    productName: string;
    quantity: number;
    price: number;
};

type FormValues = {
    items: Item[];
};