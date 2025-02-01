import { useEffect, useRef } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";

export function NumericEditTemplate(args: any, onValueChanged: (values: NumberFormatValues) => void) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            setTimeout(() => inputRef.current ? inputRef.current.focus() : undefined, 10)
        }
    }, [])

    return (
        <NumericFormat
            className="text-right w-40 border-spacing-1 border-gray-300 h-8 rounded-md border-2 bg-white"
            allowNegative={false}
            autoFocus={true}
            decimalScale={2}
            fixedDecimalScale={true}
            getInputRef={inputRef}
            onFocus={handleOnFocus}
            thousandsGroupStyle="thousand"
            thousandSeparator=','
            value={args[args.column.field] || 0}
            onValueChange={onValueChanged}
        />
    );

    function handleOnFocus(event: any): void {
        event.target.select()
    }
}