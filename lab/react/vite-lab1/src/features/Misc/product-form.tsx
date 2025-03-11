import Select, { SingleValue } from "react-select";
import { NumericFormat } from "react-number-format";
import { useForm, SubmitHandler } from "react-hook-form";

interface FormData {
    category: SingleValue<{ label: string; value: string }> | null;
    brand: SingleValue<{ label: string; value: string }> | null;
    label: SingleValue<{ label: string; value: string }> | null;
    qty: number;
    openingPrice: number;
    lastPurchaseDate: string;
}

export default function ProductForm() {
    const { register, setValue, watch, handleSubmit, reset } = useForm<FormData>({
        defaultValues: {
            category: null,
            brand: null,
            label: null,
            qty: 0,
            openingPrice: 0,
            lastPurchaseDate: ""
        }
    });

    const categories: { label: string; value: string }[] = []; // Fetch from API
    const brands: { label: string; value: string }[] = []; // Fetch from API
    const products: { label: string; value: string }[] = []; // Fetch from API

    const onSubmit: SubmitHandler<FormData> = (data) => console.log("Form Data:", data);

    return (
        <div className="border-4 border-orange-500 p-6 rounded-lg w-full max-w-lg space-y-4 bg-white shadow-md">
            {/* Category */}
            <div>
                <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-500">Category</label>
                    <button className="text-xs text-blue-500 hover:underline">Refresh</button>
                </div>
                <Select
                    options={categories}
                    placeholder="Select category"
                    className="mt-1"
                    onChange={(val) => setValue("category", val)}
                    value={watch("category")}
                />
            </div>

            {/* Brand */}
            <div>
                <label className="text-sm text-gray-500">Brand</label>
                <Select
                    options={brands}
                    placeholder="Select brand"
                    className="mt-1"
                    onChange={(val) => setValue("brand", val)}
                    value={watch("brand")}
                />
            </div>

            {/* Label */}
            <div>
                <label className="text-sm text-gray-500">Label</label>
                <Select
                    options={products}
                    placeholder="Select label"
                    className="mt-1"
                    onChange={(val) => setValue("label", val)}
                    value={watch("label")}
                />
            </div>

            {/* Quantity & Opening Price */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-gray-500">Qty</label>
                    <NumericFormat
                        className="w-full border rounded-md px-2 py-1 text-right"
                        allowNegative={false}
                        decimalScale={2}
                        fixedDecimalScale
                        onValueChange={(values) => setValue("qty", values.floatValue || 0)}
                        value={watch("qty")}
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-500">Opening Price</label>
                    <NumericFormat
                        className="w-full border rounded-md px-2 py-1 text-right"
                        allowNegative={false}
                        decimalScale={2}
                        fixedDecimalScale
                        onValueChange={(values) => setValue("openingPrice", values.floatValue || 0)}
                        value={watch("openingPrice")}
                    />
                </div>
            </div>

            {/* Last Purchase Date */}
            <div>
                <label className="text-sm text-gray-500">Last Purchase Date</label>
                <input
                    type="date"
                    className="w-full border rounded-md px-2 py-1"
                    {...register("lastPurchaseDate")}
                />
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-2">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                    onClick={handleSubmit(onSubmit)}
                >
                    Submit
                </button>
                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                    onClick={() => reset()}
                >
                    Reset
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    New Product
                </button>
            </div>
        </div>
    );
}
