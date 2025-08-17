import { useFormContext } from "react-hook-form";
import { DebitNoteFormDataType } from "./debit-notes";
import { FormField } from "../../../../controls/widgets/form-field";
import clsx from "clsx";
import { useValidators } from "../../../../utils/validators-hook";
import { Messages } from "../../../../utils/messages";
import { ControlledNumericInput } from "../../../../controls/components/controlled-numeric-input";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { useEffect } from "react";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function DebitNotesDetails() {
    const { isValidGstin, isValidHsn } = useValidators();
    const { defaultGstRate, maxGstRate } = useUtilsInfo();
    const {
        setValue,
        watch,
        register,
        trigger,
        formState: { errors }
    } = useFormContext<DebitNoteFormDataType>();
    const errorClass = 'bg-red-100 border-red-500 border-2';
    const isGstApplicable = watch('isGstApplicable')
    const isIgst = watch('isIgst');
    const inputClassRight =
        "border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-300 text-right font-medium text-sm w-full h-8 rounded px-1.5 transition-all duration-200";
    const inputClassLeft =
        "border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium text-sm w-full h-8 rounded px-1.5 transition-all duration-200";

    useEffect(() => {
        if (!isGstApplicable) {
            setValue('gstin', null)
            setValue('isIgst', false)
            setValue('cgst', 0)
            setValue('sgst', 0)
            setValue('igst', 0)
            setValue('gstRate', defaultGstRate)
            setValue('hsn', '')
            trigger()
        }
    }, [isGstApplicable, setValue, trigger, defaultGstRate])

    useEffect(() => {
        if (isIgst) {
            setValue('cgst', 0)
            setValue('sgst', 0)
        } else {
            setValue('igst', 0)
        }
        trigger()
    }, [isIgst, setValue, trigger])

    return (
        <div className="flex flex-col gap-2 rounded">

            {/* Gstin No , gst rate*/}
            {isGstApplicable &&
                <div className="flex gap-2">
                    {/* gstin */}
                    <FormField
                        label="GSTIN No"
                        error={errors?.gstin?.message}
                        className=""
                        required={watch("isGstApplicable")}
                    >
                        <input
                            type="text"
                            {...register("gstin", {
                                validate: validateGstin,
                            })}
                            className={clsx(inputClassLeft, errors?.gstin && errorClass)}
                            placeholder="Enter GSTIN no"
                        />
                    </FormField>
                    {/* Gst rate(%) */}
                    <FormField className="flex flex-col" label='' error={errors?.gstRate?.message}>
                        <label className="text-gray-600 text-sm font-medium flex items-center gap-1">
                            GST Rate (%) {isGstApplicable && <WidgetAstrix />}
                        </label>
                        <ControlledNumericInput
                            className={clsx(inputClassRight, errors?.gstRate && errorClass)}
                            fieldName="gstRate"
                            onValueChange={(floatValue) => {
                                setValue("gstRate", floatValue || 0, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                });
                                trigger();
                            }}
                            validate={validateGstRate}
                        />
                    </FormField>
                </div>
            }

            {/* HSN */}
            {isGstApplicable && <FormField
                label="HSN"
                error={errors?.hsn?.message}
                className=""
                required={watch("isGstApplicable")}
            >
                <input
                    type="text"
                    {...register("hsn", {
                        validate: validateHsn,
                    })}
                    className={clsx(inputClassLeft, errors?.hsn && errorClass)}
                    placeholder="Enter HSN"
                />
            </FormField>}

            {/* Cgst sgst */}
            {isGstApplicable && (!isIgst) && <div className="flex gap-1.5 items-end">
                {/* Cgst */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-xs font-medium">
                        CGST {!isIgst && <WidgetAstrix />}
                    </label>
                    <ControlledNumericInput
                        className={clsx(inputClassRight, errors?.cgst && errorClass, "mt-0.5")}
                        fieldName="cgst"
                        onValueChange={(floatValue) => {
                            setValue("sgst", floatValue || 0, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true,
                            });
                            trigger(["cgst", "igst"]);
                        }}
                        validate={validateCgstSgst}
                    />
                </div>
                {/* Sgst */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-xs font-medium">
                        SGST {!isIgst && <WidgetAstrix />}
                    </label>
                    <ControlledNumericInput
                        className={clsx(inputClassRight, errors?.sgst && errorClass, "mt-0.5")}
                        fieldName="sgst"
                        onValueChange={(floatValue) => {
                            setValue("cgst", floatValue || 0, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true,
                            });
                            trigger(["sgst", "igst"]);
                        }}
                        validate={validateCgstSgst}
                    />
                </div>
            </div>}

            {/* Igst */}
            {(isIgst && isGstApplicable) && <div className="flex flex-col">
                <label className="text-gray-600 text-xs font-medium">
                    IGST {isIgst ? <WidgetAstrix /> : null}
                </label>
                <ControlledNumericInput
                    className={clsx(inputClassRight, errors?.igst && errorClass, "mt-0.5")}
                    fieldName="igst"
                    onValueChange={(floatValue) => {
                        setValue("igst", floatValue || 0, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                        });
                        trigger(["cgst", "sgst"]);
                    }}
                    validate={validateIgst}
                />
            </div>}

            {/* Amount */}
            <FormField
                label="Amount"
                required
                // error={errors?.amount?.message}
                className=""
            >
                <ControlledNumericInput
                    className={clsx(inputClassRight, errors?.amount && errorClass)}
                    fieldName="amount"
                    required={true}
                    onValueChange={(floatValue) => {
                        setValue("amount", floatValue || 0, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                        });
                    }}
                    validate={(val: number) =>
                        val !== null && val !== undefined && !isNaN(val) && val > 0
                            ? true
                            : Messages.errRequired
                    }
                />
            </FormField>
        </div>
    );

    function validateCgstSgst(val: number) {
        if (!isIgst) {
            if (!val) {
                return (Messages.errRequired)
            }
        }
        return true
    }

    function validateGstin(): string | undefined {
        const gstin = watch('gstin');

        if (!isGstApplicable) return;

        if (!gstin) {
            return Messages.errRequired;
        }

        if (!isValidGstin(gstin)) {
            return Messages.errInvalidGstin;
        }

        return;
    }

    function validateGstRate(val: number) {
        if (isGstApplicable) {
            if (!val) {
                return (Messages.errRequired)
            } else {
                if (val > maxGstRate) {
                    return (Messages.errGstRateTooHigh)
                }
            }
        }
        return true
    }

    function validateHsn(value: string) {
        if (isGstApplicable) {
            if (!value) {
                return (Messages.errRequired)
            } else {
                if (!isValidHsn(value)) {
                    return (Messages.errInvalidHsn)
                }
            }
        }
        return true
    }

    function validateIgst(val: number) {
        if (isIgst) {
            if (!val) {
                return (Messages.errRequired)
            }
        }
        return true
    }
}