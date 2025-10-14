import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalePurchaseEditDataType } from '../../../../../utils/global-types-interfaces-enums';
import { UnitInfoType, Utils } from '../../../../../utils/utils';
import { format } from 'date-fns';
import { BranchAddressType } from '../../../../login/login-slice';

export function generatePurchaseInvoicePDF(
    invoiceData: SalePurchaseEditDataType,
    branchId: number | undefined,
    branchName: string,
    branchAddress: BranchAddressType | undefined,
    branchGstin: string | undefined,
    currentDateFormat: string
) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const marginLeft = 25;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const rightAlignX = pageWidth - marginLeft;
    const lineSpacing = 12;
    const { tranH, businessContacts, salePurchaseDetails, tranD, extGstTranD } = invoiceData;
    const companyInfo: UnitInfoType = Utils.getUnitInfo() || {};

    // Determine if this is head office (branchId === 1)
    const isHeadOffice = branchId === 1;

    // Determine which address to display (similar to all-vouchers-pdf.tsx)
    const displayAddress = isHeadOffice
        ? {
            address1: companyInfo.address1,
            address2: companyInfo.address2,
            pin: companyInfo.pin,
            email: companyInfo.email,
            stateCode: companyInfo.state,
            phones: branchAddress?.phones,
        }
        : {
            address1: branchAddress?.address1,
            address2: branchAddress?.address2,
            pin: branchAddress?.pin,
            email: branchAddress?.email,
            stateCode: branchAddress?.stateCode,
            phones: branchAddress?.phones,
        };

    // For GSTIN: Branch GSTIN has priority if available, otherwise use unit GSTIN
    const displayGstin = isHeadOffice
        ? companyInfo.gstin
        : branchGstin || companyInfo.gstin;

    const addr: any = businessContacts?.jAddress?.[0] || {};

    const formatNumber = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const computedQty = salePurchaseDetails.reduce((sum, item) => sum + (item.qty || 0), 0);
    const totalSubTotal = salePurchaseDetails.reduce((sum, item) => sum + ((item.price || 0) - (item.discount || 0)) * (item.qty || 0), 0);
    const computedCGST = salePurchaseDetails.reduce((sum, item) => sum + (item.cgst || 0), 0);
    const computedSGST = salePurchaseDetails.reduce((sum, item) => sum + (item.sgst || 0), 0);
    const computedIGST = salePurchaseDetails.reduce((sum, item) => sum + (item.igst || 0), 0);
    const computedAmount = salePurchaseDetails.reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalQty = computedQty;
    const totalAmount = tranD?.[0]?.amount ?? 0;
    const totalCGST = extGstTranD.cgst;
    const totalSGST = extGstTranD.sgst;
    const totalIGST = extGstTranD.igst;

    let currentY = 30;
    const addPageIfNeeded = (spaceNeeded: number) => {
        if (currentY + spaceNeeded > pageHeight - 40) {
            doc.addPage();
            currentY = 30;
        }
    };

    const drawText = (text: string, x: number, y: number, options = {}) => {
        addPageIfNeeded(20);
        doc.text(text, x, y, options);
        currentY = y;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    drawText('Invoice', pageWidth / 2, currentY, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    currentY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    drawText('Supplier Details', marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += lineSpacing;
    drawText(`${businessContacts?.contactName || ''}`, marginLeft, currentY);
    currentY += lineSpacing;
    drawText(`${addr.address1 || ''}, ${addr.address2 || ''}`, marginLeft, currentY);
    currentY += lineSpacing;
    drawText(`${addr.city || ''} - ${addr.pin || ''}, ${addr.state || ''}`, marginLeft, currentY);
    currentY += lineSpacing;
    drawText(`Email: ${businessContacts?.email || ''}`, marginLeft, currentY);
    currentY += lineSpacing;
    drawText(`Phone: ${businessContacts?.landPhone || ''}`, marginLeft, currentY);
    currentY += lineSpacing;
    drawText(`GSTIN: ${businessContacts?.gstin || ''}`, marginLeft, currentY);

    let invoiceY = 50;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Info', rightAlignX, invoiceY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    invoiceY += lineSpacing;
    doc.text(`Invoice No: ${tranH.userRefNo}`, rightAlignX, invoiceY, { align: 'right' });
    invoiceY += lineSpacing;
    doc.text(`Ref No: ${tranH.autoRefNo}`, rightAlignX, invoiceY, { align: 'right' });
    invoiceY += lineSpacing;
    doc.text(`Date: ${format(tranH.tranDate, currentDateFormat)}`, rightAlignX, invoiceY, { align: 'right' });

    currentY += 2 * lineSpacing;
    doc.setFont('helvetica', 'bold');
    drawText('Customer Details', marginLeft, currentY);
    currentY += lineSpacing;
    doc.setFont('helvetica', 'normal');

    // Company name
    drawText(companyInfo.unitName || '', marginLeft, currentY);
    currentY += lineSpacing;

    if (isHeadOffice) {
        // Head Office: Show branch name, then all details
        drawText(branchName || '', marginLeft, currentY);
        currentY += lineSpacing;

        // GSTIN in bold
        if (displayGstin) {
            doc.setFont('helvetica', 'bold');
            drawText(`GSTIN: ${displayGstin}`, marginLeft, currentY);
            doc.setFont('helvetica', 'normal');
            currentY += lineSpacing;
        }

        // Address
        if (displayAddress.address1) {
            drawText(`${displayAddress.address1}${displayAddress.address2 ? ', ' + displayAddress.address2 : ''}`, marginLeft, currentY);
            currentY += lineSpacing;
        }

        // Pin and State Code
        const pinStateText = [
            displayAddress.pin ? `Pin: ${displayAddress.pin}` : '',
            displayAddress.stateCode ? `State Code: ${displayAddress.stateCode}` : ''
        ].filter(Boolean).join(', ');
        if (pinStateText) {
            drawText(pinStateText, marginLeft, currentY);
            currentY += lineSpacing;
        }

        // Email
        if (displayAddress.email) {
            drawText(`Email: ${displayAddress.email}`, marginLeft, currentY);
            currentY += lineSpacing;
        }

    } else {
        // Branch: Show head office first, then branch details

        // Head office info (smaller font, gray color simulation via lighter text)
        doc.setFontSize(7);

        // Head Office GSTIN in bold
        if (companyInfo.gstin) {
            doc.setFont('helvetica', 'bold');
            doc.text(`Head Office: GSTIN: ${companyInfo.gstin}`, marginLeft, currentY);
            doc.setFont('helvetica', 'normal');
            currentY += lineSpacing;
        }

        // Head office address line
        const hoAddressParts = [
            companyInfo.address1,
            companyInfo.address2,
            companyInfo.pin ? `Pin: ${companyInfo.pin}` : '',
            companyInfo.state ? `State Code: ${companyInfo.state}` : '',
            companyInfo.email ? `Email: ${companyInfo.email}` : ''
        ].filter(Boolean).join(', ');

        if (hoAddressParts) {
            doc.text(hoAddressParts, marginLeft, currentY);
            currentY += lineSpacing;
        }

        doc.setFontSize(8);
        currentY += 3; // Small spacing

        // Branch name in bold
        doc.setFont('helvetica', 'bold');
        drawText(branchName || '', marginLeft, currentY);
        doc.setFont('helvetica', 'normal');
        currentY += lineSpacing;

        // Branch GSTIN in bold
        if (displayGstin) {
            doc.setFont('helvetica', 'bold');
            drawText(`GSTIN: ${displayGstin}`, marginLeft, currentY);
            doc.setFont('helvetica', 'normal');
            currentY += lineSpacing;
        }

        // Branch address
        if (displayAddress.address1) {
            drawText(`${displayAddress.address1}${displayAddress.address2 ? ', ' + displayAddress.address2 : ''}`, marginLeft, currentY);
            currentY += lineSpacing;
        }

        // Branch pin, phones, email, state code
        const branchDetails = [
            displayAddress.pin ? `Pin: ${displayAddress.pin}` : '',
            displayAddress.phones ? `Phones: ${displayAddress.phones}` : '',
            displayAddress.email ? `Email: ${displayAddress.email}` : '',
            displayAddress.stateCode ? `State Code: ${displayAddress.stateCode}` : ''
        ].filter(Boolean).join(', ');

        if (branchDetails) {
            drawText(branchDetails, marginLeft, currentY);
            currentY += lineSpacing;
        }
    }

    const tableStartY = currentY + 10;
    autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Pr Code', 'Description with S/N', 'HSN', 'Qty', 'Price', 'CGST', 'SGST', 'IGST', 'Amount']],
        body: [
            ...salePurchaseDetails.map((item, i) => [
                `${i + 1}`,
                item.productCode || '000',
                item.label + (item.serialNumbers ? '\nS/N: ' + item.serialNumbers : ''),
                item.hsn,
                { content: (item.qty || 0).toString(), styles: { halign: 'right' as const } },
                { content: formatNumber(item.price || 0), styles: { halign: 'right' as const } },
                { content: formatNumber(item.cgst || 0), styles: { halign: 'right' as const } },
                { content: formatNumber(item.sgst || 0), styles: { halign: 'right' as const } },
                { content: formatNumber(item.igst || 0), styles: { halign: 'right' as const } },
                { content: formatNumber(item.amount || 0), styles: { halign: 'right' as const } }
            ]),
            [
                { content: 'Total', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: formatNumber(computedQty), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: '' },
                { content: formatNumber(computedCGST), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: formatNumber(computedSGST), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: formatNumber(computedIGST), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: formatNumber(computedAmount), styles: { halign: 'right', fontStyle: 'bold' } }
            ]
        ],
        styles: { fontSize: 8 },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineWidth: 0.5,
            halign: 'center'
        },
        margin: { left: marginLeft, right: marginLeft },
        theme: 'grid',
        didDrawPage: (data) => {
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, rightAlignX, 20, { align: 'right' });
        },
        pageBreak: 'auto'
    });

    currentY = doc.lastAutoTable?.finalY || tableStartY + 100;
    const summaryX = marginLeft;
    const boxWidth = 220;
    const rowHeight = 18;
    const labelX = summaryX + 10;
    const valueX = summaryX + boxWidth - 10;
    const summaryRequiredHeight = 6 * rowHeight + 60;
    if (currentY + summaryRequiredHeight > pageHeight - 40) {
        doc.addPage();
        currentY = 30;
    }
    const summaryY = currentY + 30;

    doc.setFont('helvetica', 'normal');
    doc.setLineWidth(0.50);
    doc.line(summaryX, summaryY - 13, summaryX + boxWidth, summaryY - 13);
    doc.text('Summary', summaryX + boxWidth / 2, summaryY, { align: 'center' });

    const labels = ['Total Qty', 'Aggregate', 'Total CGST', 'Total SGST', 'Total IGST', 'Total Amount'];
    const values = [totalQty, totalSubTotal, totalCGST, totalSGST, totalIGST, totalAmount].map(formatNumber);

    labels.forEach((label, i) => {
        const rowY = summaryY + (i + 1) * rowHeight;
        doc.line(summaryX, rowY - rowHeight + 4, summaryX + boxWidth, rowY - rowHeight + 4);
        doc.text(label, labelX, rowY);
        doc.text(values[i], valueX, rowY, { align: 'right' });
        doc.line(summaryX + boxWidth / 2, rowY - rowHeight + 4, summaryX + boxWidth / 2, rowY + rowHeight - 6);
    });

    const totalHeight = labels.length * rowHeight + 10;
    doc.line(summaryX, summaryY - rowHeight + 4, summaryX, summaryY + totalHeight);
    doc.line(summaryX + boxWidth, summaryY - rowHeight + 4, summaryX + boxWidth, summaryY + totalHeight);
    doc.line(summaryX, summaryY + totalHeight, summaryX + boxWidth, summaryY + totalHeight);

    currentY = summaryY + totalHeight;
    const amountWords = Utils.toWordsFromAmount(totalAmount);
    doc.setFont('helvetica', 'italic');

    currentY += 20;
    doc.text(`Amount in Words: ${amountWords}`, summaryX, currentY);

    // Add spacing below amount in words to avoid overlap
    currentY += 45;

    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', rightAlignX, currentY, { align: 'right' });

    // ✅ Add page numbers at the end
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, rightAlignX, 20, { align: 'right' });
    }
    const blob = doc.output('blob');
    const blobURL = URL.createObjectURL(blob);
    window.open(blobURL);
}
