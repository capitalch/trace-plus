import clsx from "clsx";
import { Controller, useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Messages } from "../../utils/messages";

export function ControlledNumericInput({
    className
    , fieldName
    , onValueChange
    , validate
    , required = false
}: ControlledNumericInputType) {
    const {
        control,
    } = useFormContext();

    return (<Controller
        name={fieldName}
        control={control}
        rules={{
            required: required ? true : Messages.errRequired,
            validate: validate
        }}
        render={({ field }) => (
            <NumericFormat
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                onBlur={field.onBlur}
                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                value={field.value || 0}
                className={clsx(className)}
                onValueChange={({ floatValue }) =>
                    onValueChange?.(floatValue)
                }
            />
        )}
    />)
}

type ControlledNumericInputType = {
    className?: string
    fieldName: string;
    required?: boolean;
    defaultValue?: number;
    onValueChange?: (floatValue: any) => void
    validate?: (val: number) => true | string;
}