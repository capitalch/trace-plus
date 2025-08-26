    return (
        <div className="min-h-screen bg-gray-50 m-4 ml-0">
            <div className="bg-gray-100 text-gray-800 py-3 px-4 mr- rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-8 items-center">
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                            <span className="text-md whitespace-nowrap">Debits: ₹0.00</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span className="text-md whitespace-nowrap">Credits: ₹0.00</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                            <span className="text-md whitespace-nowrap">Diff: ₹0.00</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-start md:justify-end gap-3">
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                            <RotateCcw size={16} className="flex-shrink-0" />
                            <span>RESET</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                            <Eye size={16} className="flex-shrink-0" />
                            <span>VIEW</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                            <Send size={16} className="flex-shrink-0" />
                            <span>SUBMIT</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
                <InvoiceDetails invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
                <CustomerDetails selectedCustomer={selectedCustomer} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            <ItemsAndServices
                items={items}
                setItems={setItems}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
                totals={totals}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <PaymentDetails
                    paymentMethods={paymentMethods}
                    setPaymentMethods={setPaymentMethods}
                    addPaymentMethod={addPaymentMethod}
                    removePaymentMethod={removePaymentMethod}
                    salesType={salesType}
                    setSalesType={setSalesType}
                />
                <Validation
                    validateForm={validateForm}
                    showErrors={showErrors}
                    setShowErrors={setShowErrors}
                />
                <Shipping />
            </div>
        </div>
    );
};

export default FinalSalesForm;