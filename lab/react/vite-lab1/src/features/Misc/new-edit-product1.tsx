import React, { useState, useEffect } from "react";
import _ from "lodash";
import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Syncfusion component imports
import {
    TabComponent, TabItemDirective, TabItemsDirective
} from "@syncfusion/ej2-react-navigations";
import {
    TextBoxComponent, NumericTextBoxComponent, ChangeEventArgs
} from "@syncfusion/ej2-react-inputs";
import {
    DropDownListComponent, ChangeEventArgs as DropDownChangeEventArgs
} from "@syncfusion/ej2-react-dropdowns";
import {
    TooltipComponent, Position
} from "@syncfusion/ej2-react-popups";
import {
    ButtonComponent
} from "@syncfusion/ej2-react-buttons";
// import {
//     ChipComponent, ChipListComponent
// } from "@syncfusion/ej2-react-buttons";
// import {
//     CardComponent
// } from "@syncfusion/ej2-react-cards";

// Syncfusion styles - these would need to be imported in your _app.js or index.js
// import '@syncfusion/ej2-base/styles/material.css';
// import '@syncfusion/ej2-react-buttons/styles/material.css';
// import '@syncfusion/ej2-react-inputs/styles/material.css';
// import '@syncfusion/ej2-react-popups/styles/material.css';
// import '@syncfusion/ej2-react-navigations/styles/material.css';
// import '@syncfusion/ej2-react-dropdowns/styles/material.css';
// import '@syncfusion/ej2-react-cards/styles/material.css';

// Validation schema
const productSchema = z.object({
    label: z.string().min(3, { message: "Product label must be at least 3 characters" }),
    info: z.string().optional(),
    catId: z.number({ required_error: "Category is required" }),
    brandId: z.number({ required_error: "Brand is required" }),
    hsn: z.string().optional(),
    gstRate: z.number().optional(),
    upcCode: z.string().optional(),
    unitId: z.number().optional(),
    maxRetailPrice: z.number().optional(),
    salePrice: z.number().optional(),
    salePriceGst: z.number().optional(),
    dealerPrice: z.number().optional(),
    purPrice: z.number().optional(),
    purPriceGst: z.number().optional(),
    isActive: z.boolean().default(true),
});

export function NewEditProduct1() {
    // Mock data for demonstration
    const [categories, setCategories] = useState([
        { id: 1, name: "Electronics" },
        { id: 2, name: "Clothing" },
        { id: 3, name: "Home & Kitchen" }
    ]);

    const [brands, setBrands] = useState([
        { id: 1, name: "Apple" },
        { id: 2, name: "Samsung" },
        { id: 3, name: "Nike" }
    ]);

    const [units, setUnits] = useState([
        { id: 1, name: "Piece" },
        { id: 2, name: "Kg" },
        { id: 3, name: "Liter" }
    ]);

    const [calculatingGst, setCalculatingGst] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<typeof productSchema>>({
        // resolver: zodResolver(productSchema),
        mode: "onChange",
        defaultValues: {
            isActive: true,
            gstRate: 0,
            maxRetailPrice: 0,
            salePrice: 0,
            salePriceGst: 0,
            dealerPrice: 0,
            purPrice: 0,
            purPriceGst: 0,
        }
    });

    // Watch values for calculations
    const watchGstRate = watch("gstRate");
    const watchSalePrice = watch("salePrice");
    const watchPurPrice = watch("purPrice");

    // Calculate GST amounts when relevant fields change
    useEffect(() => {
        if (watchGstRate !== undefined && watchSalePrice !== undefined) {
            setCalculatingGst(true);
            const gstAmount = (watchSalePrice * (watchGstRate || 0)) / 100;
            setValue("salePriceGst", Number((watchSalePrice + gstAmount).toFixed(2)));
            setTimeout(() => setCalculatingGst(false), 500);
        }
    }, [watchGstRate, watchSalePrice, setValue]);

    useEffect(() => {
        if (watchGstRate !== undefined && watchPurPrice !== undefined) {
            setCalculatingGst(true);
            const gstAmount = (watchPurPrice * (watchGstRate || 0)) / 100;
            setValue("purPriceGst", Number((watchPurPrice + gstAmount).toFixed(2)));
            setTimeout(() => setCalculatingGst(false), 500);
        }
    }, [watchGstRate, watchPurPrice, setValue]);

    // Set form as dirty when any field changes
    const onFormChange = () => {
        setIsDirty(true);
    };

    const onSubmit = async (data: z.infer<typeof productSchema>) => {
        // Handle form submission
        console.log("Form submitted with data:", data);
        // API call would go here
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    // Tab header content templates
    const basicTabHeader = () => {
        return (
            <div>
                <span className="e-icons e-info-circle"></span>
                <span> Basic Details</span>
            </div>
        );
    };

    const specsTabHeader = () => {
        return (
            <div>
                <span className="e-icons e-paste"></span>
                <span> Specifications</span>
            </div>
        );
    };

    const pricingTabHeader = () => {
        return (
            <div>
                <span className="e-icons e-currency"></span>
                <span> Pricing</span>
            </div>
        );
    };

    return (
        <div className="container mx-auto" style={{ maxWidth: "900px" }}>
            <form onChange={onFormChange} onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className="e-card-header">
                        <div className="e-card-header-caption" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="e-card-header-title">
                                <h3>Product Information</h3>
                            </div>
                            <div>
                                {/* <ChipComponent
                                    text={isDirty ? "Unsaved Changes" : "No Changes"}
                                    cssClass={isDirty ? "e-outline e-primary" : "e-primary"}
                                /> */}
                            </div>
                        </div>
                    </div>
                    <div className="e-card-content" style={{ padding: "20px" }}>
                        <TabComponent id="productTabs" heightAdjustMode="Auto">
                            <TabItemsDirective>
                                <TabItemDirective
                                    header={{ text: "Basic Details", iconCss: "e-icons e-info-circle" }}
                                    content={() => (
                                        <div style={{ padding: "15px 0" }}>
                                            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                                                {/* Category */}
                                                <div className="form-group">
                                                    <div style={{ marginBottom: "8px" }}>
                                                        <label htmlFor="category">
                                                            Category <span style={{ color: "red" }}>*</span>
                                                        </label>
                                                        <TooltipComponent
                                                            content="Select the product category"
                                                            // position={Position.RightCenter}
                                                        >
                                                            <span className="e-icons e-question-circle" style={{ marginLeft: "5px", fontSize: "14px", cursor: "pointer" }}></span>
                                                        </TooltipComponent>
                                                    </div>
                                                    <Controller
                                                        name="catId"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <DropDownListComponent
                                                                id="category"
                                                                dataSource={categories}
                                                                fields={{ text: 'name', value: 'id' }}
                                                                placeholder="Select Category"
                                                                floatLabelType="Auto"
                                                                cssClass={errors.catId ? "e-error" : ""}
                                                                change={(args: DropDownChangeEventArgs) => field.onChange(args.value)}
                                                                value={field.value}
                                                            />
                                                        )}
                                                    />
                                                    {errors.catId && (
                                                        <div className="e-error" style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                                            {errors.catId.message}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Brand */}
                                                <div className="form-group">
                                                    <div style={{ marginBottom: "8px" }}>
                                                        <label htmlFor="brand">
                                                            Brand <span style={{ color: "red" }}>*</span>
                                                        </label>
                                                    </div>
                                                    <Controller
                                                        name="brandId"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <DropDownListComponent
                                                                id="brand"
                                                                dataSource={brands}
                                                                fields={{ text: 'name', value: 'id' }}
                                                                placeholder="Select Brand"
                                                                floatLabelType="Auto"
                                                                cssClass={errors.brandId ? "e-error" : ""}
                                                                change={(args: DropDownChangeEventArgs) => field.onChange(args.value)}
                                                                value={field.value}
                                                            />
                                                        )}
                                                    />
                                                    {errors.brandId && (
                                                        <div className="e-error" style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                                            {errors.brandId.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Label */}
                                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                                <div style={{ marginBottom: "8px" }}>
                                                    <label htmlFor="label">
                                                        Product Label <span style={{ color: "red" }}>*</span>
                                                    </label>
                                                </div>
                                                <Controller
                                                    name="label"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextBoxComponent
                                                            id="label"
                                                            placeholder="Enter product name"
                                                            floatLabelType="Auto"
                                                            cssClass={errors.label ? "e-error" : ""}
                                                            value={field.value}
                                                            change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                        />
                                                    )}
                                                />
                                                {errors.label && (
                                                    <div className="e-error" style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                                        {errors.label.message}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="form-group">
                                                <div style={{ marginBottom: "8px" }}>
                                                    <label htmlFor="info">
                                                        Product Details
                                                    </label>
                                                    <TooltipComponent
                                                        content="Additional information about the product"
                                                        // position={Position.RightCenter}
                                                    >
                                                        <span className="e-icons e-question-circle" style={{ marginLeft: "5px", fontSize: "14px", cursor: "pointer" }}></span>
                                                    </TooltipComponent>
                                                </div>
                                                <Controller
                                                    name="info"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextBoxComponent
                                                            id="info"
                                                            placeholder="Optional product description"
                                                            floatLabelType="Auto"
                                                            value={field.value}
                                                            change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                />

                                <TabItemDirective
                                    header={{ text: "Specifications", iconCss: "e-icons e-paste" }}
                                    content={() => (
                                        <div style={{ padding: "15px 0" }}>
                                            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                                                {/* HSN */}
                                                <div className="form-group">
                                                    <div style={{ marginBottom: "8px" }}>
                                                        <label htmlFor="hsn">
                                                            HSN
                                                        </label>
                                                        <TooltipComponent
                                                            content="Harmonized System Nomenclature code"
                                                            // position={Position.RightCenter}
                                                        >
                                                            <span className="e-icons e-question-circle" style={{ marginLeft: "5px", fontSize: "14px", cursor: "pointer" }}></span>
                                                        </TooltipComponent>
                                                    </div>
                                                    <Controller
                                                        name="hsn"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextBoxComponent
                                                                id="hsn"
                                                                placeholder="Enter HSN"
                                                                floatLabelType="Auto"
                                                                value={field.value}
                                                                change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                {/* GST Rate (%) */}
                                                <div className="form-group">
                                                    <div style={{ marginBottom: "8px" }}>
                                                        <label htmlFor="gstRate">
                                                            GST Rate (%)
                                                        </label>
                                                    </div>
                                                    <Controller
                                                        name="gstRate"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <NumericTextBoxComponent
                                                                id="gstRate"
                                                                format="n2"
                                                                min={0}
                                                                step={0.01}
                                                                showSpinButton={false}
                                                                floatLabelType="Auto"
                                                                value={field.value}
                                                                change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                {/* UPC code */}
                                                <div className="form-group">
                                                    <div style={{ marginBottom: "8px" }}>
                                                        <label htmlFor="upcCode">
                                                            UPC Code
                                                        </label>
                                                    </div>
                                                    <Controller
                                                        name="upcCode"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextBoxComponent
                                                                id="upcCode"
                                                                placeholder="Enter UPC"
                                                                floatLabelType="Auto"
                                                                value={field.value}
                                                                change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                {/* Unit */}
                                                <div className="form-group">
                                                    <div style={{ marginBottom: "8px" }}>
                                                        <label htmlFor="unitId">
                                                            Unit
                                                        </label>
                                                    </div>
                                                    <Controller
                                                        name="unitId"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <DropDownListComponent
                                                                id="unitId"
                                                                dataSource={units}
                                                                fields={{ text: 'name', value: 'id' }}
                                                                placeholder="Select Unit"
                                                                floatLabelType="Auto"
                                                                change={(args: DropDownChangeEventArgs) => field.onChange(args.value)}
                                                                value={field.value}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />

                                <TabItemDirective
                                    header={{ text: "Pricing", iconCss: "e-icons e-currency" }}
                                    content={() => (
                                        <div style={{ padding: "15px 0" }}>
                                            {/* Sales Pricing */}
                                            <div className="pricing-section" style={{
                                                marginBottom: "25px",
                                                padding: "15px",
                                                backgroundColor: "#f9f9f9",
                                                borderRadius: "5px",
                                                border: "1px solid #e6e6e6"
                                            }}>
                                                <h4 style={{
                                                    marginBottom: "15px",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    color: "#333"
                                                }}>
                                                    <span className="e-icons e-tag" style={{ marginRight: "5px" }}></span>
                                                    Sales Pricing
                                                </h4>
                                                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                                                    {/* Max retail price */}
                                                    <div className="form-group">
                                                        <div style={{ marginBottom: "8px" }}>
                                                            <label htmlFor="maxRetailPrice">
                                                                Max Retail Price
                                                            </label>
                                                        </div>
                                                        <Controller
                                                            name="maxRetailPrice"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <NumericTextBoxComponent
                                                                    id="maxRetailPrice"
                                                                    format="c2"
                                                                    currency="INR"
                                                                    min={0}
                                                                    step={0.01}
                                                                    showSpinButton={false}
                                                                    floatLabelType="Auto"
                                                                    value={field.value}
                                                                    change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Sale price */}
                                                    <div className="form-group">
                                                        <div style={{ marginBottom: "8px" }}>
                                                            <label htmlFor="salePrice">
                                                                Sale Price
                                                            </label>
                                                        </div>
                                                        <Controller
                                                            name="salePrice"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <NumericTextBoxComponent
                                                                    id="salePrice"
                                                                    format="c2"
                                                                    currency="INR"
                                                                    min={0}
                                                                    step={0.01}
                                                                    showSpinButton={false}
                                                                    floatLabelType="Auto"
                                                                    value={field.value}
                                                                    change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Sale price gst */}
                                                    <div className="form-group">
                                                        <div style={{ marginBottom: "8px" }}>
                                                            <label htmlFor="salePriceGst">
                                                                Sale Price (with GST)
                                                                {calculatingGst && <span style={{ marginLeft: "5px", fontSize: "12px", color: "#2196f3" }}>Calculating...</span>}
                                                            </label>
                                                        </div>
                                                        <Controller
                                                            name="salePriceGst"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <NumericTextBoxComponent
                                                                    id="salePriceGst"
                                                                    format="c2"
                                                                    currency="INR"
                                                                    min={0}
                                                                    step={0.01}
                                                                    showSpinButton={false}
                                                                    floatLabelType="Auto"
                                                                    value={field.value}
                                                                    cssClass="e-disabled"
                                                                    readonly={true}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Purchase Pricing */}
                                            <div className="pricing-section" style={{
                                                marginBottom: "25px",
                                                padding: "15px",
                                                backgroundColor: "#f9f9f9",
                                                borderRadius: "5px",
                                                border: "1px solid #e6e6e6"
                                            }}>
                                                <h4 style={{
                                                    marginBottom: "15px",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    color: "#333"
                                                }}>
                                                    <span className="e-icons e-dollar" style={{ marginRight: "5px" }}></span>
                                                    Purchase Pricing
                                                </h4>
                                                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                                                    {/* Dealer price */}
                                                    <div className="form-group">
                                                        <div style={{ marginBottom: "8px" }}>
                                                            <label htmlFor="dealerPrice">
                                                                Dealer Price
                                                            </label>
                                                        </div>
                                                        <Controller
                                                            name="dealerPrice"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <NumericTextBoxComponent
                                                                    id="dealerPrice"
                                                                    format="c2"
                                                                    currency="INR"
                                                                    min={0}
                                                                    step={0.01}
                                                                    showSpinButton={false}
                                                                    floatLabelType="Auto"
                                                                    value={field.value}
                                                                    change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Purchase price */}
                                                    <div className="form-group">
                                                        <div style={{ marginBottom: "8px" }}>
                                                            <label htmlFor="purPrice">
                                                                Purchase Price
                                                            </label>
                                                        </div>
                                                        <Controller
                                                            name="purPrice"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <NumericTextBoxComponent
                                                                    id="purPrice"
                                                                    format="c2"
                                                                    currency="INR"
                                                                    min={0}
                                                                    step={0.01}
                                                                    showSpinButton={false}
                                                                    floatLabelType="Auto"
                                                                    value={field.value}
                                                                    change={(args: ChangeEventArgs) => field.onChange(args.value)}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Purchase price gst */}
                                                    <div className="form-group">
                                                        <div style={{ marginBottom: "8px" }}>
                                                            <label htmlFor="purPriceGst">
                                                                Purchase Price (with GST)
                                                                {calculatingGst && <span style={{ marginLeft: "5px", fontSize: "12px", color: "#2196f3" }}>Calculating...</span>}
                                                            </label>
                                                        </div>
                                                        <Controller
                                                            name="purPriceGst"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <NumericTextBoxComponent
                                                                    id="purPriceGst"
                                                                    format="c2"
                                                                    currency="INR"
                                                                    min={0}
                                                                    step={0.01}
                                                                    showSpinButton={false}
                                                                    floatLabelType="Auto"
                                                                    value={field.value}
                                                                    cssClass="e-disabled"
                                                                    readonly={true}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Margin Calculation */}
                                            <div style={{
                                                padding: "10px 15px",
                                                backgroundColor: "#e7f0fd",
                                                borderRadius: "5px",
                                                border: "1px solid #cde1fb"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", color: "#0d47a1" }}>
                                                    <span className="e-icons e-chart-bar" style={{ marginRight: "8px" }}></span>
                                                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                                        Profit Margin: {
                                                            watchSalePrice && watchPurPrice
                                                                ? `${(((watchSalePrice - watchPurPrice) / watchSalePrice) * 100).toFixed(2)}%`
                                                                : 'N/A'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </TabItemsDirective>
                        </TabComponent>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                    <ButtonComponent
                        cssClass="e-outline e-primary"
                        content="Cancel"
                        iconCss="e-icons e-close"
                        onClick={() => window.history.back()}
                    />
                    <ButtonComponent
                        cssClass="e-primary"
                        content={isSubmitting ? "Saving..." : "Save Product"}
                        iconCss="e-icons e-save"
                        isPrimary={true}
                        type="submit"
                        disabled={isSubmitting || (!isDirty) || (!_.isEmpty(errors))}
                    />
                </div>
            </form>
        </div>
    );
}