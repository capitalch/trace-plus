import CustomerDetails from "./customer-details/customer-details";
import InvoiceDetails from "./invoice-details/invoice-details";
import ItemsAndServices from "./items-and-services/items-and-services";
// import ItemsAndServicesSummary from "./items-and-services/items-and-services-summary";
import PaymentDetails from "./payment-details/payment-details";
import Shipping from "./shipping/shipping";
import StatusBar from "./status-bar/status-bar";
import Validation from "./validation/validation";

export function AllSalesForm() {
    return (
        <div className="m-4 ml-0 min-h-screen bg-gray-50">
            <StatusBar />

            {/* Invoice and customer details */}
            <div className="grid py-6 gap-6 grid-cols-1 lg:grid-cols-2">
                <InvoiceDetails />                
                <CustomerDetails />
            </div>

            {/* Items and services */}
            {/* <ItemsAndServicesSummary /> */}
            <ItemsAndServices />

            {/* Bottom Sections Row */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
                <PaymentDetails />
                <Validation />
                <Shipping />
            </div>
        </div>
    );
}
