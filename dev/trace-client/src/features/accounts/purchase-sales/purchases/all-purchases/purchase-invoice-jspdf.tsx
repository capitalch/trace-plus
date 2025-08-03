// PurchaseInvoice.js - Generates a Purchase Invoice using jsPDF and autoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalePurchaseEditDataType } from '../../../../../utils/global-types-interfaces-enums';

export function generatePurchaseInvoicePDF(invoiceData: SalePurchaseEditDataType) {
    const doc = new jsPDF();

    // Company Details (Placeholder)
    doc.setFontSize(12);
    doc.text('My Company Pvt Ltd', 14, 15);
    doc.text('123, Business Street, City, State - 123456', 14, 21);
    doc.text('GSTIN: XXAAAA0000A1Z5', 14, 27);

    // Invoice Title
    doc.setFontSize(16);
    doc.text('Purchase Invoice', 105, 40, { align: 'center' });

    // Invoice Info
    const { tranH, businessContacts, extGstTranD, salePurchaseDetails } = invoiceData;
    doc.setFontSize(10);
    doc.text(`Invoice No: ${tranH.userRefNo}`, 14, 50);
    doc.text(`Auto Ref No: ${tranH.autoRefNo}`, 14, 56);
    doc.text(`Date: ${new Date(tranH.tranDate).toLocaleDateString()}`, 14, 62);

    // Supplier Details
    const addr = businessContacts?.jAddress?.[0] || {};
    doc.text('Supplier:', 14, 72);
    doc.text(`${businessContacts?.contactName}`, 14, 78);
    doc.text(`${addr.address1 || ''}, ${addr.address2 || ''}`, 14, 84);
    doc.text(`${addr.city || ''} - ${addr.pin || ''}, ${addr.state || ''}`, 14, 90);
    doc.text(`Email: ${businessContacts?.email || ''}`, 14, 96);
    doc.text(`Phone: ${businessContacts?.landPhone || ''}`, 14, 102);
    doc.text(`GSTIN: ${businessContacts?.gstin || ''}`, 14, 108);

    // Item Table
    autoTable(doc, {
        startY: 118,
        head: [[
            'S.No', 'Product Code', 'Description', 'HSN', 'Qty', 'Rate', 'CGST', 'SGST', 'Amount'
        ]],
        body: salePurchaseDetails.map((item, index) => [
            index + 1,
            item.productCode,
            item.label,
            item.hsn,
            item.qty,
            item.price.toFixed(2),
            item.cgst.toFixed(2),
            item.sgst.toFixed(2),
            item.amount.toFixed(2)
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [240, 240, 240] },
    });

    // Totals
    const yAfterTable = doc?.lastAutoTable?.finalY || 0 + 10;
    doc.text(`Sub Total: ${salePurchaseDetails[0].price.toFixed(2)}`, 150, yAfterTable);
    doc.text(`CGST: ${extGstTranD.cgst.toFixed(2)}`, 150, yAfterTable + 6);
    doc.text(`SGST: ${extGstTranD.sgst.toFixed(2)}`, 150, yAfterTable + 12);
    doc.text(`Total: ${salePurchaseDetails[0].amount.toFixed(2)}`, 150, yAfterTable + 18);

    // Declaration and Signature
    doc.text(
        'Declaration: Goods once sold will not be taken back. Subject to Kolkata jurisdiction.',
        14,
        yAfterTable + 30
    );
    doc.text('Authorized Signatory', 160, yAfterTable + 50);
    const blob = doc.output("blob");
    const blobURL = URL.createObjectURL(blob);
    window.open(blobURL);
    //   doc.save(`${tranH.userRefNo || 'invoice'}.pdf`);
}
