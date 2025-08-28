import React, { useEffect, useState } from 'react';
import { Utils } from '../../../../../utils/utils';
import { useUtilsInfo } from '../../../../../utils/utils-info-hook';
import { SqlIdsMap } from '../../../../../app/maps/sql-ids-map';
// import _, { set } from 'lodash';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import { ListBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import './customer-search.css';

interface CustomerSearchProps {
    searchString?: string;
    // onClose?: () => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ searchString }) => {
    const [listBoxCustomers, setListBoxCustomers] = useState<ListBoxCustomerType[]>([])
    const [filteredCount, setFilteredCount] = useState<number>(0)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [listBoxRef, setListBoxRef] = useState<any>(null)
    const {
        buCode
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        loadCustomers();
    }, [searchString])

    useEffect(() => {
        // Prevent background scroll when component is mounted
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore background scroll when component is unmounted
            document.body.style.overflow = 'unset';
        };
    }, [])

    // Monitor for filter changes
    useEffect(() => {
        if (listBoxRef) {
            const checkFilteredCount = () => {
                const listBoxElement = document.getElementById('customerListBox');
                if (listBoxElement) {
                    const visibleItems = listBoxElement.querySelectorAll('.e-list-item:not([style*="display: none"])');
                    const currentVisible = visibleItems.length;
                    if (currentVisible !== filteredCount && currentVisible <= totalCount) {
                        setFilteredCount(currentVisible);
                    }
                }
            };

            // Check periodically
            const interval = setInterval(checkFilteredCount, 200);
            return () => clearInterval(interval);
        }
    }, [listBoxRef, totalCount, filteredCount])

    function formatCustomerDisplay(customer: ContactsType, index: number) {
        return {
            index,
            name: customer.contactName || 'Unnamed Customer',
            mobile: [customer.mobileNumber, customer.otherMobileNumber, customer.landPhone].filter(Boolean).join(', '),
            email: customer.email,
            address: [customer.address1, customer.address2, customer.city, customer.state, customer.country].filter(Boolean).join(', '),
            gstin: customer.gstin
        };
    }

    // Styles object for better organization
    const styles = {
        overlay: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            overflowY: 'auto' as const,
            padding: '20px'
        },
        container: {
            position: 'relative' as const,
            maxWidth: '800px',
            margin: '0 auto',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto' as const
        }
    };

    return (
        <>
            <div style={styles.overlay}>
                <div style={styles.container}>
                    <div className="bg-white rounded-lg shadow-md border border-gray-200">
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Customer Search Results
                                </h3>
                                <button
                                    onClick={handleOnClose}
                                    className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-red-600"
                                    title="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {totalCount > 0 && (
                                <p className="text-sm text-gray-600 mt-1 flex items-center">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Found {totalCount} customer{totalCount !== 1 ? 's' : ''}
                                    {filteredCount !== totalCount && (
                                        <span className="text-blue-600 font-medium ml-2">
                                            ({filteredCount} shown)
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                        <div className="p-4">
                            {listBoxCustomers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-gray-700 mb-2">No customers found</p>
                                    <p className="text-sm text-gray-500 text-center max-w-sm">
                                        {searchString ?
                                            `No results for "${searchString}". Try adjusting your search terms.` :
                                            'Start typing to search for customers.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3 px-2">
                                        <span>Select a customer from the list below:</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {filteredCount} result{filteredCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <ListBoxComponent
                                        id="customerListBox"
                                        dataSource={listBoxCustomers}
                                        height="400"
                                        allowFiltering={true}
                                        change={onCustomerSelect}
                                        selectionSettings={{ mode: 'Single' }}
                                        fields={{ text: 'text', value: 'id' }}
                                        cssClass="custom-listbox"
                                        filterBarPlaceholder="Search by name, phone, email, address, or GSTIN..."
                                        filterType="Contains"
                                        ignoreCase={true}
                                        created={(scope: any) => {
                                            setListBoxRef(scope);
                                        }}
                                        actionComplete={(args: any) => {
                                            // This event fires after filtering is complete
                                            if (args.requestType === 'filtering') {
                                                setTimeout(() => {
                                                    const listBoxElement = document.getElementById('customerListBox');
                                                    if (listBoxElement) {
                                                        const visibleItems = listBoxElement.querySelectorAll('.e-list-item[style*="display: list-item"], .e-list-item:not([style*="display"])');
                                                        setFilteredCount(visibleItems.length);
                                                    }
                                                }, 50);
                                            }
                                        }}
                                        filtering={(args: any) => {
                                            // Immediate update on filter start
                                            if (!args.query || args.query.trim() === '') {
                                                setFilteredCount(totalCount);
                                            }
                                        }}
                                        itemTemplate={(data: any) => {
                                            const customerData = data.customerData;
                                            return (
                                                <div className="customer-item-container">
                                                    <div className="customer-item-name">
                                                        {customerData.index}. {customerData.name}
                                                    </div>
                                                    {customerData.mobile && (
                                                        <div className="customer-item-mobile">
                                                            📱 {customerData.mobile}
                                                        </div>
                                                    )}
                                                    {customerData.email && (
                                                        <div className="customer-item-email">
                                                            ✉️ {customerData.email}
                                                        </div>
                                                    )}
                                                    {customerData.address && (
                                                        <div className="customer-item-address">
                                                            🏠 {customerData.address}
                                                        </div>
                                                    )}
                                                    {customerData.gstin && (
                                                        <div className="customer-item-gstin">
                                                            🏢 GSTIN: {customerData.gstin}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    function handleOnClose() {
        Utils.showHideModalDialogA({
            isOpen: false
        })
    }

    async function loadCustomers() {
        if (!searchString || searchString.trim().length === 0) {
            setListBoxCustomers([]);
            return;
        }

        try {
            const result: ContactsType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                sqlId: SqlIdsMap.getContactsOnRegexp,
                sqlArgs: {
                    searchString: searchString
                }
            });
            if (!result || result.length === 0) {
                setListBoxCustomers([]);
                return;
            }
            const listBoxData = result.map((customer, index) => ({
                id: customer.id || 0,
                text: `${customer.contactName || ''} ${customer.mobileNumber || ''} ${customer.otherMobileNumber || ''} ${customer.landPhone || ''} ${customer.email || ''} ${customer.address1 || ''} ${customer.address2 || ''} ${customer.city || ''} ${customer.state || ''} ${customer.country || ''} ${customer.gstin || ''}`.toLowerCase(),
                customerData: formatCustomerDisplay(customer, index + 1),
                data: customer
            }));
            setListBoxCustomers(listBoxData);
            setTotalCount(listBoxData.length);
            setFilteredCount(listBoxData.length);
        } catch (err) {
            console.error('Error loading customers:', err);
            setListBoxCustomers([]);
            setTotalCount(0);
            setFilteredCount(0);
        }
    }

    function onCustomerSelect(args: any) {
        // if (args.value) {
        //     const selectedItem = setListBoxCustomers.find(item => item.id === args.value);
        //     if (selectedItem) {
        //         selectCustomer(selectedItem.data);
        //     }
        // }
    }

    // function selectCustomer(customer: ContactsType) {
    //     console.log('Selected customer:', customer);
    // }
};

export default CustomerSearch;

type ListBoxCustomerType = {
    id: number;
    text: string;
    customerData: any;
    data: ContactsType;
}