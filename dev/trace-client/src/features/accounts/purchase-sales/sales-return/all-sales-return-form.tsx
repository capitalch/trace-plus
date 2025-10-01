import { useEffect } from "react";
import SalesReturnStatusBar from "./sales-return-controls/sales-return-status-bar";
import SalesReturnHeaderSection from "./sales-return-controls/sales-return-header-section";
import SalesReturnItemsAndServices from "./sales-return-controls/sales-return-items-and-services";
import SalesReturnAccountingDetails from "./sales-return-controls/sales-return-accounting-details";
import SalesReturnValidation from "./sales-return-controls/sales-return-validation";

export function AllSalesReturnForm() {

    useEffect(() => {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }, []);

    return (
        <div className="m-4 ml-0 min-h-screen bg-gray-50 text-">
            {/* Status Bar */}
            <SalesReturnStatusBar />

            {/* Merged Invoice and Customer Details */}
            <SalesReturnHeaderSection />

            {/* Items and services for sales return */}
            <SalesReturnItemsAndServices />

            {/* Bottom Sections Row - Accounting Details and Validation */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-10">
                <div className="lg:col-span-6">
                    <SalesReturnAccountingDetails />
                </div>
                <div className="lg:col-span-4">
                    <SalesReturnValidation />
                </div>
            </div>
        </div>
    );
}