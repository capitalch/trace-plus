import React, { useEffect, useState } from 'react';
import { Utils } from '../../../../../utils/utils';
import { useUtilsInfo } from '../../../../../utils/utils-info-hook';
import { SqlIdsMap } from '../../../../../app/maps/sql-ids-map';
import _ from 'lodash';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import { ListBoxComponent } from '@syncfusion/ej2-react-dropdowns';

interface CustomerSearchProps {
    searchString?: string;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ searchString }) => {
    const [customers, setCustomers] = useState<ContactsType[]>([]);
    const [loading, setLoading] = useState(false);
    const {
        buCode
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        loadCustomers();
    }, [searchString])

    // Create display data for ListBox with concatenated fields
    const listBoxData = customers.map(customer => ({
        id: customer.id || '',
        text: `${customer.contactName || ''} | ${customer.mobileNumber || ''} | ${customer.email || ''} | ${customer.address1 || ''}`.replace(/\|\s*\|/g, '|').replace(/^\s*\|\s*|\s*\|\s*$/g, ''),
        data: customer
    }));

    const listBoxFields = {
        text: 'text',
        value: 'id'
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="py-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Search</h3>
                {searchString ? (
                    <p className="text-gray-700 mb-4">Searching for: <span className="font-semibold">"{searchString}"</span></p>
                ) : (
                    <p className="text-gray-500 mb-4">No search query provided</p>
                )}

                {loading && (
                    <div className="text-center py-4">
                        <p className="text-gray-500">Loading customers...</p>
                    </div>
                )}

                {!loading && customers.length > 0 && (
                    <div className="mt-4">
                        <ListBoxComponent
                            id="customerListBox"
                            dataSource={listBoxData}
                            fields={listBoxFields}
                            height="300px"
                            allowFiltering={false}
                            change={onCustomerSelect}
                            cssClass="custom-listbox"
                        />
                    </div>
                )}

                {!loading && customers.length === 0 && searchString && (
                    <div className="text-center py-4">
                        <p className="text-gray-500">No customers found for "{searchString}"</p>
                    </div>
                )}
            </div>
        </div>
    );

    async function loadCustomers() {
        if (!searchString || searchString.trim().length === 0) {
            setCustomers([]);
            return;
        }
        
        setLoading(true);
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

            if (_.isEmpty(result)) {
                setCustomers([]);
            } else {
                setCustomers(result);
            }
        } catch (err) {
            console.error('Error loading customers:', err);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }

    function onCustomerSelect(args: any) {
        if (args.value) {
            const selectedItem = listBoxData.find(item => item.id === args.value);
            if (selectedItem) {
                selectCustomer(selectedItem.data);
            }
        }
    }

    function selectCustomer(customer: ContactsType) {
        console.log('Selected customer:', customer);
        // TODO: Implement customer selection logic
        // This could involve updating the parent form with selected customer data
        // and closing the modal
    }
};

export default CustomerSearch;