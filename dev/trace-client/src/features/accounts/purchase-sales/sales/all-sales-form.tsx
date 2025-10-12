import InvoiceDetails from "./invoice-details/invoice-details";
import CustomerDetails from "./customer-details/customer-details";
import ItemsAndServices from "./items-and-services/items-and-services";
import PaymentDetails from "./payment-details/payment-details";
import Shipping from "./shipping/shipping";
import StatusBar from "./status-bar/status-bar";
import Validation from "./validation/validation";
import { useEffect } from "react";
import { useScrollToTop } from "../../../../utils/use-scroll-to-top-hook";

export function AllSalesForm() {
    const { scrollToTop } = useScrollToTop();

    useEffect(() => {
        scrollToTop();
    }, [scrollToTop]);

    return (
        <div className="m-4 ml-0 min-h-screen bg-gray-50">
            <StatusBar />            
            {/* Invoice and Customer Details - Separate Components */}
            <div className="grid py-6 gap-6 grid-cols-1 lg:grid-cols-2">
                <InvoiceDetails />
                <CustomerDetails />
            </div>

            {/* Items and services */}
            <ItemsAndServices />

            {/* Bottom Sections Row - With Validation moved to bottom right */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <PaymentDetails />
                </div>
                <div className="lg:col-span-3">
                    <Shipping />
                </div>
                <div className="lg:col-span-2">
                    <Validation />
                </div>
            </div>
        </div>
    );
}
