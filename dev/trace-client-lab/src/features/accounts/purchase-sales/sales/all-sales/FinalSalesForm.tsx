import React from 'react';
import InvoiceDetails from './invoice-details/invoice-details';
import CustomerDetails from './customer-details/customer-details';
import ItemsAndServices from './items-and-services/items-and-services';
import PaymentDetails from './payment-details/payment-details';
import Validation from './validation/validation';
import Shipping from './shipping/shipping';
import StatusBar from './status-bar/status-bar';

const FinalSalesForm: React.FC = () => {

    return (
        <div className="min-h-screen bg-gray-50 m-4 ml-0">
            <StatusBar />

            {/* Invoice and customer details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
                <InvoiceDetails />
                
                <CustomerDetails />
            </div>

            {/* Items and services */}
            <ItemsAndServices />

            {/* Bottom Sections Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <PaymentDetails />

                <Validation />

                <Shipping />
            </div>
        </div>
    );
};

export default FinalSalesForm;