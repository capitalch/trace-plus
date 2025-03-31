import { useFieldArray, useFormContext } from "react-hook-form";
import { StockJournalType } from "./stock-journal-main";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
// import { Messages } from "../../../../../utils/messages";

export function StockJournalLineItems(stockJournalLineItems: StockJournalLineItemsType) {
    const { control, watch, register, setValue } =
        useFormContext<StockJournalType>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: stockJournalLineItems.name
    });

    return (<div className="flex flex-col">
        <label className="font-bold">{stockJournalLineItems.title || 'Source'}</label>
        <table>
            <thead>
                <tr className="bg-gray-100 text-primary-500 text-xs font-medium text-left">
                    <th className="p-1 border w-10">#</th>
                    <th className="p-1 border w-32">UPC / Product Code</th>
                    <th className="p-1 border w-36">Line Ref No</th>
                    <th className="p-1 border">Line Remarks</th>
                    <th className="p-1 border w-28 text-right">Qty</th>
                    <th className="p-1 border w-40 text-right">Price</th>
                    <th className="p-1 border">Serial Numbers</th>
                    <th className="p-1 border w-36 text-right">Amount</th>
                    <th className="border"></th>
                </tr>
            </thead>
            <tbody>
                {
                    fields.map((item, index) => {

                        return (
                            <tr key={index} className="border hover:bg-gray-50">
                                {/* index */}
                                <td className="p-2 border">{index + 1}</td>

                                {/* product code */}
                                <td className="p-2 flex flex-col relative w-40">
                                    <span
                                        tabIndex={-1}
                                        className="text-xs mb-1 text-teal-500 text-center"
                                    >
                                        {watch(`${stockJournalLineItems.name}.${index}.upcCode`) ||
                                            "------------"}
                                    </span>
                                    <div className="flex items-center align-middle justify-center">
                                        <input
                                            type="text"
                                            {...register(`${stockJournalLineItems.name}.${index}.productCode`, {
                                                // onChange: (e) => onChangeProductCode(e, index),
                                                // validate: () => {
                                                //     return productId
                                                //         ? true
                                                //         : Messages.errProductNotSelected;
                                                // }
                                            })}
                                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                            value={
                                                watch(`${stockJournalLineItems.name}.${index}.productCode`) ?? ""
                                            }
                                            className={clsx(
                                                "border p-2 rounded w-full",
                                                inputFormFieldStyles,
                                                // productId ? "" : "border-red-500 bg-red-100"
                                            )}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <button
                                                aria-label="Search Product"
                                                tabIndex={-1}
                                                type="button"
                                                onClick={() => handleProductSearch(index)}
                                                className="ml-2 text-blue-500"
                                            >
                                                <IconSearch />
                                            </button>
                                            <button
                                                aria-label="Clear Product"
                                                tabIndex={-1}
                                                type="button"
                                                onClick={() => handleProductClear(index)}
                                                className="ml-2 text-blue-500"
                                            >
                                                <IconClear />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Error Indicator & Tooltip Button */}
                                    {/* {errorIndicatorAndTooltipForProductId(index)} */}
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
            <tfoot>
                <tr className="bg-gray-200 font-semibold text-primary-500">
                    
                </tr>
            </tfoot>
        </table>
    </div>)

    function handleProductClear(index: number) {
        console.log(index)
    }

    function handleProductSearch(index: number) {
        console.log(index)
    }
}

type StockJournalLineItemsType = {
    instance: string
    name: 'sourceLineItems' | 'destLineItems'
    title: string
}