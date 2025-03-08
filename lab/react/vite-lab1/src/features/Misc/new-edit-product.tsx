import _ from "lodash";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import Select from "react-select";
import { Messages } from "./messages";
import clsx from "clsx";
import { useState } from "react";

export function NewEditProduct() {
    const [isHovered, setIsHovered] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        // watch,
        // control,
    } = useForm<NewEditProductType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            gstRate: 0,
            salePrice: 0,
            maxRetailPrice: 0,
            dealerPrice: 0,
            salePriceGst: 0,
            purPriceGst: 0,
            purPrice: 0,
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
                    <h1 className="text-2xl font-bold text-white">
                        Product Details
                    </h1>
                    <p className="text-primary-100 text-sm mt-1">
                        Enter product information below
                    </p>
                </div>

                <div className="p-4 space-y-6">
                    {/* Basic Information */}
                    <Section title="Basic Information" icon="information-circle">
                        <div className="grid grid-cols-2 gap-6">
                            <FormField label="Category" required error={errors.catId?.message}>
                                <Select
                                    placeholder="Select category..."
                                    options={[]}
                                    styles={selectStyles}
                                    className="mt-1"
                                />
                            </FormField>

                            <FormField label="Brand" required error={errors.brandId?.message}>
                                <Select
                                    placeholder="Select brand..."
                                    options={[]}
                                    styles={selectStyles}
                                    className="mt-1"
                                />
                            </FormField>

                            <FormField 
                                label="Product Label" 
                                required 
                                error={errors.label?.message}
                                className="col-span-2"
                            >
                                <input
                                    type="text"
                                    className={inputStyles}
                                    placeholder="Enter product name"
                                    {...register('label', {
                                        required: Messages.errRequired,
                                        minLength: {
                                            value: 2,
                                            message: "Minimum 2 characters required"
                                        }
                                    })}
                                />
                            </FormField>

                            <FormField 
                                label="Description" 
                                className="col-span-2"
                                error={errors.info?.message}
                            >
                                <textarea
                                    className={clsx(inputStyles, "resize-none")}
                                    placeholder="Describe your product..."
                                    rows={4}
                                    {...register('info', {
                                        maxLength: {
                                            value: 500,
                                            message: "Maximum 500 characters"
                                        }
                                    })}
                                />
                                <span className="text-xs text-gray-500 mt-1 flex justify-end">
                                    {/* <span className={watch("info")?.length > 400 ? "text-amber-500" : ""}>
                                        {watch("info")?.length || 0}
                                    </span>/500 characters */}
                                </span>
                            </FormField>
                        </div>
                    </Section>

                    {/* Specifications */}
                    <Section title="Specifications" icon="clipboard-list">
                        <div className="grid grid-cols-4 gap-6">
                            <FormField label="HSN">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    placeholder="000000"
                                    thousandSeparator
                                    {...register('hsn')}
                                />
                            </FormField>

                            <FormField label="GST Rate">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    decimalScale={2}
                                    suffix="%"
                                    {...register('gstRate')}
                                />
                            </FormField>

                            <FormField label="UPC Code">
                                <NumericFormat
                                    allowNegative={false}
                                    className={inputStyles}
                                    placeholder="000000000000"
                                    {...register('upcCode')}
                                />
                            </FormField>

                            <FormField label="Unit">
                                <Select
                                    placeholder="Select unit..."
                                    options={[]}
                                    styles={selectStyles}
                                    className="mt-1"
                                />
                            </FormField>
                        </div>
                    </Section>

                    {/* Pricing */}
                    <Section title="Pricing" icon="currency-dollar">
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-6">
                                <FormField label="Max Retail Price" error={errors.maxRetailPrice?.message}>
                                    <NumericFormat
                                        allowNegative={false}
                                        className={inputStyles}
                                        decimalScale={2}
                                        thousandSeparator
                                        {...register('maxRetailPrice', {
                                            // validate: value => 
                                            //     value >= salePrice || "Must be >= sale price"
                                        })}
                                    />
                                </FormField>

                                <FormField label="Sale Price">
                                    <NumericFormat
                                        allowNegative={false}
                                        className={inputStyles}
                                        decimalScale={2}
                                        thousandSeparator
                                        {...register('salePrice')}
                                    />
                                </FormField>

                                <FormField label="Sale Price (GST)">
                                    <NumericFormat
                                        allowNegative={false}
                                        className={inputStyles}
                                        decimalScale={2}
                                        thousandSeparator
                                        {...register('salePriceGst')}
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <FormField label="Dealer Price">
                                    <NumericFormat
                                        allowNegative={false}
                                        className={inputStyles}
                                        decimalScale={2}
                                        thousandSeparator
                                        {...register('dealerPrice')}
                                    />
                                </FormField>

                                <FormField label="Purchase Price">
                                    <NumericFormat
                                        allowNegative={false}
                                        className={inputStyles}
                                        decimalScale={2}
                                        thousandSeparator
                                        {...register('purPrice')}
                                    />
                                </FormField>

                                <FormField label="Purchase Price (GST)">
                                    <NumericFormat
                                        allowNegative={false}
                                        className={inputStyles}
                                        decimalScale={2}
                                        thousandSeparator
                                        {...register('purPriceGst')}
                                    />
                                </FormField>
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-5 flex justify-between items-center border-t">
                    <button
                        type="button"
                        className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-all duration-200"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <div 
                        className="relative"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <WidgetButtonSubmitFullWidth
                            label={isSubmitting ? "Saving..." : "Save Product"}
                            disabled={isSubmitting || !isDirty || !_.isEmpty(errors)}
                            className="w-48 transition-all duration-300"
                        />
                        {isHovered && !_.isEmpty(errors) && (
                            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                                Please fix form errors first
                                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45"></span>
                            </span>
                        )}
                        {isHovered && !isSubmitting && _.isEmpty(errors) && !isDirty && (
                            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                                Make changes first
                                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-700 rotate-45"></span>
                            </span>
                        )}
                        {isHovered && !isSubmitting && _.isEmpty(errors) && isDirty && (
                            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                                Save your changes
                                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-600 rotate-45"></span>
                            </span>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

// Section Component
function Section({ title, children, icon }: { 
    title: string; 
    children: React.ReactNode;
    icon?: string;
}) {
    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary-800 flex items-center gap-2">
                {icon && <span className="w-1.5 h-6 bg-primary-500 rounded-full" />}
                {title}
            </h2>
            <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                {children}
            </div>
        </div>
    );
}

// Form Field Component
function FormField({ label, children, required, error, className }: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    className?: string;
}) {
    return (
        <label className={clsx("flex flex-col text-primary-800", className)}>
            <div className="flex items-center gap-1 mb-1.5">
                <span className="font-medium text-sm">{label}</span>
                {required && <WidgetAstrix />}
            </div>
            {children}
            {error && <WidgetFormErrorMessage errorMessage={error} />}
        </label>
    );
}

// Styles
const inputStyles = clsx(
    "w-full rounded-lg border border-gray-200 px-4 py-3 bg-white",
    "focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none",
    "placeholder:text-gray-400 text-sm transition-all duration-200",
    "hover:border-gray-300"
);

const selectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        marginTop: "0.25rem",
        borderRadius: "0.5rem",
        borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
        backgroundColor: "white",
        padding: "0.4rem",
        "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : "#d1d5db"
        },
        boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.25)" : "none",
    }),
    menu: (base: any) => ({
        ...base,
        borderRadius: "0.5rem",
        marginTop: "0.25rem",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
        color: state.isSelected ? "white" : "#111827",
        padding: "0.5rem 1rem",
    })
};

// Updated Button Styling
export function WidgetButtonSubmitFullWidth({ 
    className = '', 
    label, 
    onClick, 
    props, 
    disabled=false 
}: WidgetButtonSubmitFullWidthType) {
    return (
        <button 
            onClick={onClick} 
            {...props} 
            disabled={disabled}
            className={clsx(
                className,
                "rounded-lg h-12 px-6 text-white font-medium text-sm",
                "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800",
                "disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:opacity-70",
                "transition-all duration-200 transform hover:scale-102 hover:shadow-md",
                "focus:ring-4 focus:ring-primary-200 focus:outline-none",
                "flex items-center justify-center gap-2"
            )}
        >
            {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {label}
        </button>
    );
}

function onSubmit(data: NewEditProductType) {
    console.log("Form submitted:", data);
    // API call would go here
    return new Promise(resolve => setTimeout(resolve, 2000));
}

// Rest of the existing components
export type NewEditProductType = {
    id?: number;
    catId?: number;
    brandId?: number;
    unitId?: number;
    label: string;
    productCode: string;
    hsn?: string;
    upcCode?: string;
    gstRate?: number;
    salePrice?: number;
    isActive?: boolean;
    maxRetailPrice?: number;
    dealerPrice?: number;
    salePriceGst?: number;
    purPriceGst?: number;
    purPrice?: number;
    info?: string;
};

export function WidgetAstrix() {
    return (<span className="text-red-500 font-bold">*</span>)
}

export function WidgetFormErrorMessage({ className = '', errorMessage }: WidgetFormErrorMessageType) {
    return (
        <span className={clsx(className, "mt-1.5 text-xs text-error-500 flex items-center gap-1")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {errorMessage}
        </span>
    )
}

type WidgetFormErrorMessageType = {
    className?: string
    errorMessage: any
}

type WidgetButtonSubmitFullWidthType = {
    className?: string
    label: string
    onClick?: (data?:any) => void
    props?: any
    disabled?: boolean
}

// Declare isSubmitting to fix the error in button component
const isSubmitting = false;