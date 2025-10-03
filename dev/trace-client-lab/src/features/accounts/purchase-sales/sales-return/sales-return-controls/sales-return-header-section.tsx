import { useEffect } from 'react';
import { FileText, Search, } from 'lucide-react';
import { FormField } from '../../../../../controls/widgets/form-field';
import clsx from 'clsx';
import { useValidators } from '../../../../../utils/validators-hook';
import { SalesReturnFormDataType } from '../all-sales-return';
import { useFormContext } from 'react-hook-form';
import { Messages } from '../../../../../utils/messages';
import { Utils } from '../../../../../utils/utils';
import { ContactsType, ExtGstTranDType, SalePurchaseDetailsWithExtraType, SalePurchaseEditDataType, TranDExtraType, TranDType, TranHType } from '../../../../../utils/global-types-interfaces-enums';
import { useUtilsInfo } from '../../../../../utils/utils-info-hook';
import { SalesReturnSearchInvoice } from './sales-return-search-invoice';
import { SqlIdsMap } from '../../../../../app/maps/sql-ids-map';
import { DataInstancesMap } from '../../../../../app/maps/data-instances-map';
import { ContactDisplayDataType, ShippingInfoType } from '../../sales/all-sales';
import Decimal from 'decimal.js';

const SalesReturnHeaderSection: React.FC = () => {
    const instance = DataInstancesMap.allSalesReturn
    const inputFormFieldStyle = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const { checkAllowedDate, isValidGstin } = useValidators();
    const { buCode, dbName, decodedDbParamsObject, defaultGstRate } = useUtilsInfo();

    const {
        watch,
        getValues,
        register,
        setValue,
        trigger,
        reset,
        formState: { errors, }
    } = useFormContext<SalesReturnFormDataType>();
    const { getDefaultCreditAccount, resetAll } = useFormContext<SalesReturnFormDataType>() as any;
    const isGstInvoice = watch('isGstInvoice');
    const hasCustomerGstin = watch('hasCustomerGstin');

    // Clear GSTIN when hasCustomerGstin or isGstInvoice is false
    useEffect(() => {
        if (!hasCustomerGstin || !isGstInvoice) {
            setValue("gstin", null);
        }
    }, [hasCustomerGstin, isGstInvoice, setValue]);

    useEffect(() => {
        const salesReturnLineItems = getValues('salesReturnLineItems');
        if (salesReturnLineItems && salesReturnLineItems.length > 0) {
            let hasChanges = false;
            const updatedLineItems = salesReturnLineItems.map(item => {
                if (!isGstInvoice) {
                    // When GST is unchecked, set all gstRate to 0
                    if (item.gstRate !== 0) {
                        hasChanges = true;
                        return { ...item, gstRate: 0 };
                    }
                } else {
                    // When GST is checked, set gstRate to defaultGstRate for any rows with gstRate 0
                    if (item.gstRate === 0) {
                        hasChanges = true;
                        return { ...item, gstRate: defaultGstRate };
                    }
                }
                return item;
            });

            if (hasChanges) {
                setValue('salesReturnLineItems', updatedLineItems);
            }
        }
    }, [isGstInvoice, setValue, getValues, defaultGstRate]);

    // const contactsData = watch('contactsData');
    useEffect(() => {
        // Copies contactsData to contactDisplayData for display
        const contactsData: ContactsType | null = getValues('contactsData');
        if (contactsData) {
            const displayData = formatContactDisplay(contactsData);
            setValue('contactDisplayData', displayData);
        }
    }, [ getValues, setValue, trigger]);

    return (
        <div className="py-6">
            {/* Single merged header section with invoice and customer details */}
            <div className="relative px-4 py-4 bg-white border-blue-400 border-l-4 rounded-lg shadow-sm">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6 flex-wrap">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="font-semibold text-gray-900 text-lg">Sales Return Details</h2>
                    </div>

                    {/* Toggle Controls and Auto Ref No */}
                    <div className="flex items-center space-x-4">
                        {/* GST Invoice Toggle */}
                        <label className="flex items-center cursor-pointer flex-wrap gap-y-2">
                            <input
                                type="checkbox"
                                className="sr-only"
                                {...register("isGstInvoice")}
                            />
                            <div className={clsx(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                                watch("isGstInvoice") ? "bg-blue-500" : "bg-gray-300"
                            )}>
                                <span
                                    className={clsx(
                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                        watch("isGstInvoice") ? "translate-x-5" : "translate-x-0.5"
                                    )}
                                />
                            </div>
                            <span className="ml-2 font-medium text-gray-700 text-sm">
                                GST Invoice
                            </span>
                        </label>

                        {/* IGST Toggle */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only"
                                {...register("isIgst")}
                            />
                            <div className={clsx(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                                watch("isIgst") ? "bg-green-500" : "bg-gray-300"
                            )}>
                                <span
                                    className={clsx(
                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                        watch("isIgst") ? "translate-x-5" : "translate-x-0.5"
                                    )}
                                />
                            </div>
                            <span className="ml-2 font-medium text-gray-700 text-sm">
                                IGST
                            </span>
                        </label>
                    </div>
                </div>

                {/* Main Content Grid - eight sections in a single row */}
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {/* Auto ref no */}
                    <FormField label='Auto Ref No' className="">
                        <input
                            type="text"
                            className={clsx(inputFormFieldStyle, "bg-gray-100 rounded text-sm")}
                            readOnly
                            disabled
                            title="Auto reference number"
                            value={watch("autoRefNo") ?? ''}
                        />
                    </FormField>
                    {/* Transaction date */}
                    <FormField label="Return Date" required className=''>
                        <input
                            type="date"
                            className={clsx(
                                inputFormFieldStyle,
                                errors?.tranDate && "border-red-500 bg-red-100"
                            )}
                            {...register("tranDate", {
                                required: Messages.errDateFieldRequired,
                                validate: checkAllowedDate
                            })}
                        />
                    </FormField>

                    {/* Select Sales Invoice */}
                    <FormField label="Search Criteria for Sales Invoice" className='col-span-2'>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                className={clsx(inputFormFieldStyle, 'flex-1')}
                                placeholder="Give inv no, cust name, mobile..."
                                {...register("salesReturnSearchText")}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearchInvoice();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSearchInvoice}
                                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </FormField>

                    {/* Sale Invoice No, Customer GSTIN Controls - All in same column */}
                    <div className="flex flex-col space-y-3">
                        {/* Sale Invoice No */}
                        <FormField label="Sale Invoice No" required>
                            <div className="flex space-x-1">
                                <input
                                    type="text"
                                    className={clsx(inputFormFieldStyle, 'h-8 flex-1 text-sm', errors?.userRefNo && "border-red-500 bg-red-100")}
                                    {...register("userRefNo", {
                                        required: Messages.errRequired
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={handleFindByInvoiceNo}
                                    className="text-blue-500 rounded-md hover:text-blue-800 transition-colors"
                                    title="Search by invoice number"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </FormField>

                        {/* Customer has GSTIN Toggle */}
                        <div className="flex flex-col">

                            <div className="flex items-center space-x-2">
                                <label className={clsx(
                                    "flex items-center",
                                    isGstInvoice ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                )}>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        {...register("hasCustomerGstin")}
                                        disabled={!isGstInvoice}
                                    />
                                    <div className={clsx(
                                        "relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200",
                                        !isGstInvoice
                                            ? "bg-gray-200"
                                            : watch("hasCustomerGstin") ? "bg-green-500" : "bg-gray-300"
                                    )}>
                                        <span
                                            className={clsx(
                                                "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200",
                                                isGstInvoice && watch("hasCustomerGstin") ? "translate-x-4" : "translate-x-0.5"
                                            )}
                                        />
                                    </div>
                                    <span className={clsx(
                                        "ml-2 text-xs font-medium",
                                        isGstInvoice ? "text-gray-700" : "text-gray-400"
                                    )}>
                                        Customer Has GSTIN
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* GSTIN No Field */}
                        <FormField
                            label="GSTIN No"
                            required={isGstInvoice && hasCustomerGstin}
                            error={errors?.gstin?.message}
                        >
                            <input
                                type="text"
                                {...register('gstin', {
                                    validate: validateGstin,
                                })}
                                className={clsx(
                                    inputFormFieldStyle, 'h-8',
                                    (!isGstInvoice || !hasCustomerGstin) && "bg-gray-100 cursor-not-allowed opacity-60",
                                    errors?.gstin && "border-red-500 bg-red-100"
                                )}
                                placeholder="Enter GSTIN"
                                disabled={!isGstInvoice || !hasCustomerGstin}
                            />
                        </FormField>
                    </div>

                    {/* Customer Details */}
                    <label className="flex flex-col text-sm col-span-2">
                        <span className="font-medium">Customer Details</span>
                        <div className="flex flex-col justify-between p-3  bg-gray-50 border rounded-lg">
                            <div className="text-sm space-y-1">
                                <div>
                                    <span className="font-medium text-gray-900">{watch('contactDisplayData.name')}</span>
                                </div>
                                <div className="text-gray-600">
                                    <span className="font-medium">Phone: </span>
                                    {watch('contactDisplayData.mobile')}
                                </div>
                                <div className="text-gray-600">
                                    <span className="font-medium">Email: </span>
                                    <span>{watch('contactDisplayData.email')}</span>
                                </div>
                                <div className="text-gray-600">
                                    <div className="line-clamp-2">
                                        <span className="font-medium">Address: </span>
                                        <span className="break-words">{watch('contactDisplayData.address')}</span>
                                    </div>
                                </div>
                                <div className="pt-1 text-gray-600 text-xs border-t">
                                    <span className="font-medium">GSTIN: </span>
                                    {watch('contactDisplayData.gstin')}
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Remarks */}
                    <FormField label="Remarks">
                        <textarea
                            rows={5}
                            className={clsx(inputFormFieldStyle, "text-sm")}
                            placeholder="Add any special instructions or notes for this return..."
                            {...register("remarks")}
                        />
                    </FormField>
                </div>
            </div>
        </div>
    );

    function formatContactDisplay(contact: ContactsType): ContactDisplayDataType {
        return {
            id: contact.id || 0,
            name: contact.contactName || 'Unnamed Contact',
            mobile: [contact.mobileNumber, contact.otherMobileNumber, contact.landPhone].filter(Boolean).join(', '),
            email: contact.email || '',
            address: [contact.address1, contact.address2, contact.city, contact.state, contact.country].filter(Boolean).join(', '),
            gstin: contact.gstin || ''
        };
    }

    async function getSalesDetailsOnId(id: number | undefined) {
        if (!id) {
            return
        }

        return (await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            instance: instance,
            sqlId: SqlIdsMap.getSalePurchaseDetailsOnId,
            sqlArgs: {
                id: id,
            },
        }))
    }

    async function getSalesEditDataOnId(id: number | undefined) {
        const editData: any = await getSalesDetailsOnId(id)
        const salesEditData: SalePurchaseEditDataType = editData?.[0]?.jsonResult
        if (!salesEditData) {
            return null
        }
        const tranH: TranHType = salesEditData.tranH
        const shippingInfo: ShippingInfoType | null = tranH?.jData?.shipTo ? tranH.jData.shipTo as any : null
        salesEditData.shippingInfo = shippingInfo
        return (salesEditData)
    }

    function getContactsDisplayData(contact: ContactsType | null) {
        if (contact) {
            const displayData = {
                name: contact.contactName,
                address: `${contact.address1 || ''}, ${contact.address2 || ''}, ${contact.city || ''}, ${contact.state || ''}, ${contact.pin ? 'pin: ' + contact.pin : ''}`.replace(/(, )+/g, ', ').replace(/^(, )+|(, )+$/g, ''),
                gstin: contact.gstin || '',
                email: contact.email || '',
                mobile: contact.mobileNumber || '',
            };
            return displayData;
        }
    }

    async function handleInvoiceSelected(id: number) {
        const salesEditData: SalePurchaseEditDataType | null = await getSalesEditDataOnId(id)
        if (!salesEditData) {
            Utils.showErrorMessage(Messages.errNoDataFound)
            return
        }

        const tranH = salesEditData.tranH;
        const billTo: ContactsType | null = salesEditData.billTo || null;
        const tranD: TranDExtraType[] = salesEditData.tranD
        const extGsTranD: ExtGstTranDType = salesEditData.extGstTranD
        const salePurchaseDetails: SalePurchaseDetailsWithExtraType[] = salesEditData.salePurchaseDetails
        const totalInvoiceAmount = new Decimal(tranD.find((item) => item.dc === "C")?.amount || 0)
        const creditAccount: TranDType = getDefaultCreditAccount()
        creditAccount.accId = tranD.find((item) => item.dc === "D")?.accId || null

        reset({
            id: undefined,
            autoRefNo: undefined,
            userRefNo: tranH.autoRefNo || '',
            remarks: tranH.remarks || '',
            tranTypeId: Utils.getTranTypeId('SaleReturn'),
            isGstInvoice: Boolean(extGsTranD?.id),
            debitAccId: tranD.find((item) => item.dc === "C")?.accId,
            creditAccount: creditAccount,
            gstin: extGsTranD?.gstin,
            isIgst: extGsTranD?.igst ? true : false,
            hasCustomerGstin: Boolean(extGsTranD?.gstin),

            totalCgst: new Decimal(extGsTranD?.cgst),
            totalSgst: new Decimal(extGsTranD?.sgst),
            totalIgst: new Decimal(extGsTranD?.igst),
            totalQty: new Decimal(salePurchaseDetails.reduce((sum, item) => sum + (item.qty || 0), 0)),
            totalInvoiceAmount: totalInvoiceAmount,
            contactDisplayData: getContactsDisplayData(billTo),
            contactsData: billTo,
            salesReturnLineItems: salePurchaseDetails.map((item) => ({
                id: undefined,
                productId: item.productId,
                productCode: item.productCode,
                upcCode: item.upcCode || null,
                productDetails: `${item.brandName} ${item.catName} ${item.label}}`,
                hsn: item.hsn.toString(),
                qty: item.qty,
                gstRate: item.gstRate,
                price: item.price,
                discount: item.discount,
                priceGst: item.priceGst,
                lineRemarks: item.remarks || null,
                serialNumbers: item.serialNumbers || null,
                amount: item.amount,
                cgst: item.cgst,
                sgst: item.sgst,
                igst: item.igst,
                subTotal: ((item.price || 0) - (item.discount || 0)) * (item.qty || 0)
            })),
        })
    }

    async function handleFindByInvoiceNo() {
        const invoiceNo = getValues('userRefNo') || '';
        if (!invoiceNo.trim()) {
            Utils.showAlertMessage('Alert', Messages.messEnterInvoiceNo);
            return;
        }
        try {
            // Search by exact invoice number
            const ret = await await Utils.doGenericQuery({
                buCode: buCode || "",
                dbName: dbName || "",
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlId: SqlIdsMap.getIdOnAutoRefNo,
                sqlArgs: {
                    autoRefNo: invoiceNo.trim(),
                },
            })
            const id = ret?.[0]?.id
            if(!id){
                Utils.showAlertMessage('Alert', Messages.errNoDataFound);
                resetAll();
                return;
            }
            await handleInvoiceSelected(id);
        } catch (e) {
            console.error(e)
        }
    }

    function handleSearchInvoice() {
        const searchText = getValues('salesReturnSearchText') || '';
        if (!searchText.trim()) {
            Utils.showAlertMessage('Alert', Messages.messEmptyValuesNotAllowed);
            return;
        }
        Utils.showHideModalDialogA({
            isOpen: true,
            title: "Select Sales Invoice",
            element: <SalesReturnSearchInvoice searchText={searchText} onSelect={handleInvoiceSelected} />,
            size: 'lg'
        });
    }

    function validateGstin(): string | undefined {
        const gstin = watch('gstin');
        if ((!isGstInvoice) || (!hasCustomerGstin)) return;
        if (!gstin) {
            return Messages.errCustGstinRequired;
        }
        if (!isValidGstin(gstin)) {
            return Messages.errInvalidGstin;
        }
        return;
    }
};

export default SalesReturnHeaderSection;