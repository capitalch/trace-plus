import React, { useEffect, useState, useCallback } from 'react';
import { Utils } from '../../../../../utils/utils';
import { useUtilsInfo } from '../../../../../utils/utils-info-hook';
import { SqlIdsMap } from '../../../../../app/maps/sql-ids-map';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import { ListBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { ActionCompleteEventArgs, } from '@syncfusion/ej2-dropdowns';
import './customer-search.css';
import { IconCross } from '../../../../../controls/icons/icon-cross';
import { IconCrown } from '../../../../../controls/icons/icon-crown';
import { IconPerson } from '../../../../../controls/icons/icon-person';
import { ContactDisplayDataType, SalesFormDataType } from '../all-sales';
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form';

interface ContactSearchProps {
    searchString?: string;
    setValue: UseFormSetValue<SalesFormDataType>;
    trigger: UseFormTrigger<SalesFormDataType>;
    selectedId: number | null;
}

const ContactSearch: React.FC<ContactSearchProps> = ({ searchString, setValue, trigger, selectedId }) => {
    const [listBoxContacts, setListBoxContacts] = useState<ListBoxContactType[]>([])
    const [filteredCount, setFilteredCount] = useState<number>(0)
    const [totalCount, setTotalCount] = useState<number>(0)
    const {
        buCode
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo();
    const listRef = React.useRef<ListBoxComponent>(null);

    function handleOnClose() {
        Utils.showHideModalDialogA({
            isOpen: false
        })
    }

    const loadContacts = useCallback(async () => {
        if (!searchString || searchString.trim().length === 0) {
            setListBoxContacts([]);
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
                setListBoxContacts([]);
                return;
            }
            const listBoxData = result.map((contact, index) => ({
                id: contact?.id || 0,
                text: `${contact.contactName || ''} ${contact.mobileNumber || ''} ${contact.otherMobileNumber || ''} ${contact.landPhone || ''} ${contact.email || ''} ${contact.address1 || ''} ${contact.address2 || ''} ${contact.city || ''} ${contact.state || ''} ${contact.country || ''} ${contact.gstin || ''}`.toLowerCase(),
                contactDisplayData: formatContactDisplay(contact, index + 1),
                data: contact
            }));
            setListBoxContacts(listBoxData);
            setTotalCount(listBoxData.length);
            setFilteredCount(listBoxData.length);
            
            // Auto-select if only one result
            if (result.length === 1) {
                setValue('contactData', result[0]);
                handleOnClose();
                trigger();
            }
        } catch (err) {
            console.error('Error loading contacts:', err);
            setListBoxContacts([]);
            setTotalCount(0);
            setFilteredCount(0);
        }
    }, [searchString, buCode, dbName, decodedDbParamsObject, setValue, trigger]);

    useEffect(() => {
        loadContacts();
    }, [loadContacts])

    // useEffect(() => {
    //     // Set selected value after data is loaded
    //     if (selectedId && listBoxContacts.length > 0 && listRef.current) {
    //         const selectedItem = listBoxContacts.find(item => item.id === selectedId);
    //         if (selectedItem) {
    //             listRef.current.selectItems([selectedItem.text]);
    //         }
    //     }
    // }, [selectedId, listBoxContacts])

    useEffect(() => {
        // Prevent background scroll when component is mounted
        document.body.style.overflow = 'hidden';
        return () => {
            // Restore background scroll when component is unmounted
            document.body.style.overflow = 'unset';
        };
    }, [])

    function formatContactDisplay(contact: ContactsType, index: number): ContactDisplayDataType {
        return {
            index,
            id: contact.id || 0,
            name: contact.contactName || 'Unnamed Contact',
            mobile: [contact.mobileNumber, contact.otherMobileNumber, contact.landPhone].filter(Boolean).join(', '),
            email: contact.email || '',
            address: [contact.address1, contact.address2, contact.city, contact.state, contact.country].filter(Boolean).join(', '),
            gstin: contact.gstin || ''
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
        <div style={styles.overlay}>
            <div style={styles.container}>
                <div className="bg-white border border-gray-200 rounded-lg shadow-md">
                    <div className="p-4 border-b border-gray-100 rounded-t-lg bg-gradient-to-r from-gray-50 to-blue-50">

                        {/* header */}
                        <div className="flex items-center justify-between">
                            {/* Title */}
                            <h3 className="flex items-center font-semibold text-gray-800 text-lg">
                                <IconCrown className="mr-2 w-5 h-5 text-blue-600" />
                                Customer Search Results
                            </h3>
                            {/* Close button */}
                            <button
                                onClick={handleOnClose}
                                className="p-2 text-gray-500 rounded-full transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                                title="Close"
                            >
                                <IconCross className="w-5 h-5" />
                            </button>
                        </div>

                        {totalCount > 0 && (
                            <p className="flex items-center mt-1 text-gray-600 text-sm">
                                <span className="inline-block mr-2 w-2 h-2 bg-green-500 rounded-full"></span>
                                Found {totalCount} customer{totalCount !== 1 ? 's' : ''}
                                {filteredCount !== totalCount && (
                                    <span className="ml-2 font-medium text-blue-600">
                                        ({filteredCount} shown)
                                    </span>
                                )}
                            </p>
                        )}
                    </div>

                    <div className="p-4">
                        {listBoxContacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <div className="mb-4 p-6 bg-gray-100 rounded-full">
                                    <IconPerson className="w-12 h-12 text-gray-400" />
                                </div>
                                <p className="mb-2 font-medium text-gray-700 text-lg">No contacts found</p>
                                <p className="max-w-sm text-center text-gray-500 text-sm">
                                    {searchString ?
                                        `No results for "${searchString}". Try adjusting your search terms.` :
                                        'Start typing to search for contacts.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-3 px-2 text-gray-600 text-sm">
                                    <span>Select a customer from the list below:</span>
                                    <span className="px-2 py-1 text-blue-700 text-xs bg-blue-100 rounded">
                                        {filteredCount} result{filteredCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <ListBoxComponent
                                    actionComplete={(args: ActionCompleteEventArgs) => {
                                        // This event fires after filtering is complete
                                        const filtered = (args.result as any)?.length || 0;
                                        setFilteredCount(filtered);

                                    }}
                                    allowFiltering={true}
                                    change={onContactSelect}
                                    cssClass="custom-listbox"
                                    dataSource={listBoxContacts}
                                    fields={{ text: 'text', value: 'id' }}
                                    filterBarPlaceholder="Search by name, phone, email, address, or GSTIN..."
                                    filterType="Contains"
                                    height="400"
                                    id="contactListBox"
                                    ignoreCase={true}
                                    itemTemplate={(data: any) => {
                                        const contactDisplayData = data.contactDisplayData;
                                        const isSelected = contactDisplayData?.id === selectedId;
                                        return (
                                            <div className={`contact-item-container ${isSelected ? 'selected-contact' : ''}`}
                                                style={isSelected ? {
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    padding: '14px 18px',
                                                    margin: '-14px -18px',
                                                    borderLeft: '6px solid #f59e0b'
                                                } : {}}>
                                                <div className="contact-item-name" 
                                                    style={isSelected ? { color: '#fbbf24', fontWeight: 'bold' } : {}}>
                                                    {contactDisplayData?.index}. {contactDisplayData?.name}
                                                </div>
                                                {contactDisplayData?.mobile && (
                                                    <div className="contact-item-mobile"
                                                        style={isSelected ? { color: '#34d399', fontWeight: 'bold' } : {}}>
                                                        📱 {contactDisplayData.mobile}
                                                    </div>
                                                )}
                                                {contactDisplayData?.email && (
                                                    <div className="contact-item-email"
                                                        style={isSelected ? { color: '#e5e7eb' } : {}}>
                                                        ✉️ {contactDisplayData.email}
                                                    </div>
                                                )}
                                                {contactDisplayData?.address && (
                                                    <div className="contact-item-address"
                                                        style={isSelected ? { color: '#e5e7eb' } : {}}>
                                                        🏠 {contactDisplayData.address}
                                                    </div>
                                                )}
                                                {contactDisplayData?.gstin && (
                                                    <div className="contact-item-gstin"
                                                        style={isSelected ? { color: '#c084fc', fontWeight: 'bold' } : {}}>
                                                        🏢 GSTIN: {contactDisplayData.gstin}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }}
                                    ref={listRef}
                                    selectionSettings={{ mode: 'Single' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    function onContactSelect(args: any) {
        const contactData = args?.items?.[0]?.data;
        setValue('contactData', contactData || null);
        handleOnClose();
        trigger();
    }

};

export default ContactSearch;

type ListBoxContactType = {
    id: number;
    text: string;
    contactDisplayData: ContactDisplayDataType;
    data: ContactsType;
}