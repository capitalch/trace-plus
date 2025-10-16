import jsPDF from 'jspdf';
import _ from 'lodash';
import autoTable from 'jspdf-autotable';
import { SalePurchaseEditDataType } from '../../../../utils/global-types-interfaces-enums';
import { UnitInfoType, Utils } from '../../../../utils/utils';
import { format } from 'date-fns';
import { ShippingInfoType } from './all-sales';
import { BranchAddressType } from '../../../login/login-slice';

export function generateSalesInvoicePDF(
  invoiceData: SalePurchaseEditDataType,
  branchId: number | undefined,
  branchName: string,
  branchAddress: BranchAddressType | undefined,
  branchGstin: string | undefined,
  currentDateFormat: string
) {
  // const doc = new jsPDF({ unit: 'pt', format: [595, 420], orientation: 'landscape' }); // Always takes higher number as height
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' }); // Half A4 width
  const marginLeft = 25;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const { tranH, billTo, salePurchaseDetails, tranD, extGstTranD, shippingInfo } = invoiceData;
  const companyInfo: UnitInfoType = Utils.getUnitInfo() || {};

  // Determine if this is head office (branchId === 1)
  const isHeadOffice = branchId === 1;

  // Determine which address to display (similar to purchase-invoice-jspdf.tsx)
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


  const formatNumber = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const computedQty = salePurchaseDetails.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalSubTotal = salePurchaseDetails.reduce((sum, item) => sum + ((item.price || 0) - (item.discount || 0)) * (item.qty || 0), 0);
  const computedCGST = salePurchaseDetails.reduce((sum, item) => sum + (item.cgst || 0), 0);
  const computedSGST = salePurchaseDetails.reduce((sum, item) => sum + (item.sgst || 0), 0);
  const computedIGST = salePurchaseDetails.reduce((sum, item) => sum + (item.igst || 0), 0);
  const computedAmount = salePurchaseDetails.reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalAmount = tranD.find(item => item.dc === 'C')?.amount ?? 0;
  const totalCGST = extGstTranD?.cgst || 0;
  const totalSGST = extGstTranD?.sgst || 0;
  const totalIGST = extGstTranD?.igst || 0;

  let currentY = 30;

  // Pagination helper functions
  const addPageIfNeeded = (spaceNeeded: number) => {
    if (currentY + spaceNeeded > pageHeight - 40) {
      doc.addPage();
      currentY = 30;
    }
  };

  // Company Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(companyInfo.unitName || '', marginLeft, currentY);
  currentY += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (isHeadOffice) {
    // Head Office: Show branch name, then all details
    doc.setFont('helvetica', 'bold');
    doc.text(branchName || '', marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 10;

    // GSTIN in bold
    if (displayGstin) {
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN: ${displayGstin}`, marginLeft, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 10;
    }

    // Address
    if (displayAddress.address1) {
      doc.text(`${displayAddress.address1?.trim() || ''}${displayAddress.address2 ? ', ' + displayAddress.address2.trim() : ''}`, marginLeft, currentY);
      currentY += 10;
    }

    // Pin and State Code
    const pinStateText = [
      displayAddress.pin ? `Pin: ${displayAddress.pin}` : '',
      displayAddress.stateCode ? `State code: ${displayAddress.stateCode}` : ''
    ].filter(Boolean).join(', ');
    if (pinStateText) {
      doc.text(pinStateText, marginLeft, currentY);
      currentY += 10;
    }

    // Contact details
    const contactParts = [
      displayAddress.phones ? `Ph: ${displayAddress.phones}` : '',
      displayAddress.email ? `Email: ${displayAddress.email}` : '',
      companyInfo.webSite ? `Web: ${companyInfo.webSite}` : ''
    ].filter(Boolean).join(', ');
    if (contactParts) {
      doc.text(contactParts, marginLeft, currentY);
      currentY += 10;
    }

  } else {
    // Branch: Show head office first, then branch details

    // Head office info (smaller font)
    doc.setFontSize(7);

    // Head Office GSTIN in bold
    if (companyInfo.gstin) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Head Office: GSTIN: ${companyInfo.gstin}`, marginLeft, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 10;
    }

    // Head office address line - wrapped to prevent overlap with Tax Invoice section
    const hoAddressParts = [
      companyInfo.address1,
      companyInfo.address2,
      companyInfo.pin ? `Pin: ${companyInfo.pin}` : '',
      companyInfo.state ? `State code: ${companyInfo.state}` : '',
      companyInfo.email ? `Email: ${companyInfo.email}` : '',
      companyInfo.webSite ? `Web: ${companyInfo.webSite}` : ''
    ].filter(Boolean).join(', ');

    if (hoAddressParts) {
      // Wrap text to prevent overlap with right section (Tax Invoice)
      const maxWidth = pageWidth * 0.60; // Use 60% of page width to leave space for Tax Invoice section
      const hoAddressLines = doc.splitTextToSize(hoAddressParts, maxWidth);
      doc.text(hoAddressLines, marginLeft, currentY);
      currentY += hoAddressLines.length * 10;
    }

    doc.setFontSize(9);
    currentY += 3; // Small spacing

    // Branch name in bold
    doc.setFont('helvetica', 'bold');
    doc.text(branchName || '', marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 10;

    // Branch GSTIN in bold
    if (displayGstin) {
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN: ${displayGstin}`, marginLeft, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 10;
    }

    // Branch address
    if (displayAddress.address1) {
      doc.text(`${displayAddress.address1?.trim() || ''}${displayAddress.address2 ? ', ' + displayAddress.address2.trim() : ''}`, marginLeft, currentY);
      currentY += 10;
    }

    // Branch pin, phones, email, state code
    const branchDetails = [
      displayAddress.pin ? `Pin: ${displayAddress.pin}` : '',
      displayAddress.phones ? `Ph: ${displayAddress.phones}` : '',
      displayAddress.email ? `Email: ${displayAddress.email}` : '',
      displayAddress.stateCode ? `State code: ${displayAddress.stateCode}` : ''
    ].filter(Boolean).join(', ');

    if (branchDetails) {
      doc.text(branchDetails, marginLeft, currentY);
      currentY += 10;
    }
  }

  const leftColumnX = marginLeft;
  const leftColumnWidth = pageWidth * 0.7; // 70% width for left section
  const rightColumnWidth = pageWidth * 0.3 - marginLeft - 10; // 30% width for right section
  const maxLeftColumnWidth = leftColumnWidth - 25; // Prevent text overflow in left
  const maxRightColumnWidth = rightColumnWidth - 25; // Prevent text overflow in right

  // Tax Invoice header (right side) - align with company header
  const rightSectionX = marginLeft + leftColumnWidth - 25;
  let rightSectionY = 30; // Start at same Y as company header

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TAX INVOICE', rightSectionX, rightSectionY);
  rightSectionY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Original for recipient', rightSectionX, rightSectionY);
  rightSectionY += 15;

  // Invoice details (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #: ${tranH.autoRefNo}`, rightSectionX, rightSectionY);
  rightSectionY += 11;
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${format(tranH.tranDate, currentDateFormat)}`, rightSectionX, rightSectionY);
  rightSectionY += 11;
  doc.text('Type: Sale', rightSectionX, rightSectionY);

  // Ensure currentY is below company header
  currentY = Math.max(currentY, rightSectionY + 20);

  // Customer Details and Shipping Address (side by side)
  let leftY = currentY;
  let rightY = currentY;

  // Customer Details (left side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Customer Details', leftColumnX, leftY);
  leftY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(billTo?.contactName || '', leftColumnX, leftY);
  leftY += 10;

  doc.setFont('helvetica', 'normal');
  if (billTo?.gstin) {
    doc.text(`GSTIN: ${billTo.gstin}`, leftColumnX, leftY);
    leftY += 10;
  }

  const billToAddress = [billTo?.address1,
  billTo?.address2,
  billTo?.pin ? `Pin: ${billTo?.pin}` : '',
  billTo?.city,
  billTo?.state,
  billTo?.country,
  billTo?.mobileNumber ? `Ph: ${billTo?.mobileNumber}` : '',
  billTo?.otherMobileNumber ? `, ${billTo?.otherMobileNumber}` : '',
  billTo?.email ? `Email: ${billTo?.email}` : ''
  ]
    .filter(part => part && part.trim() !== '')
    .join(', ');

  if (billToAddress) {
    const addressLines = doc.splitTextToSize(billToAddress, maxLeftColumnWidth);
    doc.text(addressLines, leftColumnX, leftY);
    leftY += addressLines.length * 10;
  }

  if (tranH.remarks) {
    const remarkLines = doc.splitTextToSize(`Remarks: ${tranH.remarks}`, maxLeftColumnWidth);
    doc.text(remarkLines, leftColumnX, leftY);
    leftY += remarkLines.length * 10;
  }
  // Shipping Address (right side)
  const shipTo: ShippingInfoType | undefined | null = shippingInfo;
  if (!_.isEmpty(shipTo)) {
    // Ensure shipping address starts after invoice details
    rightY = Math.max(rightY, rightSectionY + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Shipping Address', rightSectionX, rightY);
    rightY += 12;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const shipToAddress = [shipTo?.name,
    shipTo?.address1,
    shipTo?.address2,
    shipTo?.pin ? `Pin: ${shipTo?.pin}` : '',
    shipTo?.city,
    shipTo?.state,
    shipTo?.country,
    shipTo?.mobileNumber ? `Ph: ${shipTo?.mobileNumber}` : '',
    shipTo?.email ? `Email: ${shipTo?.email}` : ''
    ]
      .filter(part => part && part.trim() !== '')
      .join(', ');
    if (shipToAddress) {
      const shippingLines = doc.splitTextToSize(shipToAddress, maxRightColumnWidth);
      doc.text(shippingLines, rightSectionX, rightY);
      rightY += shippingLines.length * 10;
    }
  }

  currentY = Math.max(leftY, rightY) + 10;

  // Add horizontal line after the header sections
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(marginLeft, currentY - 10, pageWidth - marginLeft, currentY - 10);

  // Items table
  const tableStartY = currentY - 8 //+ 5;
  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Items', 'Qty', 'Price', 'Disc', 'Aggregate', 'Tax amount (%)', 'Amount']],
    body: [
      ...salePurchaseDetails.map((item, i) => [
        `${i + 1}`,
        `${item.brandName || ''} ${item.catName || ''} ${item.label || ''}${item.hsn ? `, HSN ${item.hsn}` : ''}${item.serialNumbers ? `, Sl nos: ${item.serialNumbers}` : ''}`,
        { content: (item.qty || 0).toString(), styles: { halign: 'right' as const } },
        { content: formatNumber(item.price || 0), styles: { halign: 'right' as const } },
        { content: formatNumber(item.discount || 0), styles: { halign: 'right' as const } },
        { content: formatNumber(((item.price || 0) - (item.discount || 0)) * (item.qty || 0)), styles: { halign: 'right' as const } },
        { content: `${formatNumber((item.cgst || 0) + (item.sgst || 0) + (item.igst || 0))} (${item.gstRate || 0}.00)`, styles: { halign: 'right' as const } },
        { content: formatNumber(item.amount || 0), styles: { halign: 'right' as const } }
      ]),
      [
        '',
        { content: 'Total', styles: { fontStyle: 'bold' } },
        { content: computedQty.toString(), styles: { halign: 'right', fontStyle: 'bold' } },
        '',
        { content: formatNumber(0), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totalSubTotal), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(computedCGST + computedSGST + computedIGST), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(computedAmount), styles: { halign: 'right', fontStyle: 'bold' } }
      ]
    ],
    styles: { fontSize: 9, cellPadding: { top: 5, right: 2, bottom: 5, left: 2 } },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: 'left',
      fontStyle: 'bold'
    },
    didParseCell: function (data: any) {
      // Right align Qty, Rate, Disc, Aggregate, Tax amount, Amount headers
      if (data.section === 'head' && [2, 3, 4, 5, 6, 7].includes(data.column.index)) {
        data.cell.styles.halign = 'right';
      }
    },
    didDrawCell: function (data: any) {
      // Draw horizontal line after header row
      if (data.section === 'head') {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }

      // Draw horizontal lines above and below the total row
      const totalRowIndex = salePurchaseDetails.length; // Index of the total row
      if (data.section === 'body' && data.row.index === totalRowIndex) {
        // Line above total row
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
        // Line below total row
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - marginLeft, 20, { align: 'right' });
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left', minCellWidth: 25 }, // #
      1: { cellWidth: 'auto', minCellWidth: 120 }, // Items
      2: { cellWidth: 'auto', halign: 'right', minCellWidth: 30 }, // Qty
      3: { cellWidth: 'auto', halign: 'right', minCellWidth: 65 }, // Price
      4: { cellWidth: 'auto', halign: 'right', minCellWidth: 45 }, // Disc
      5: { cellWidth: 'auto', halign: 'right', minCellWidth: 70 }, // Aggregate
      6: { cellWidth: 'auto', halign: 'right', minCellWidth: 80 }, // Tax amount (%)
      7: { cellWidth: 'auto', halign: 'right', minCellWidth: 70 }, // Amount
    },
    margin: { left: marginLeft, right: marginLeft },
    theme: 'plain',
    pageBreak: 'auto'
  });

  currentY = doc.lastAutoTable?.finalY || tableStartY + 100;
  currentY += 15;

  // Track positions for receipts and summary to avoid overlaps
  let receiptEndY = currentY;
  let summaryStartY = currentY;

  // Receipts section (left side)
  const receiptDebitAccounts = tranD.filter(item => item.dc === 'D');
  if (receiptDebitAccounts.length > 0) {
    // Check if we need a new page for receipts section
    const receiptsSectionHeight = 100 + (receiptDebitAccounts.length * 20); // Estimate height needed
    addPageIfNeeded(receiptsSectionHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Receipts / Debits', marginLeft, currentY);

    const receiptTableY = currentY + 8;

    // Receipts table
    autoTable(doc, {
      startY: receiptTableY,
      head: [['#', 'Dr. Account', 'Details', 'Amount', 'Status']],
      body: receiptDebitAccounts.map((account, i) => [
        `${i + 1}`,
        account.accCode || 'Nothing',
        [account.instrNo, account.lineRefNo, account.remarks].filter(Boolean).join(' | ') || '',
        { content: formatNumber(account.amount || 0), styles: { halign: 'right' as const, fontStyle: ['debtor', 'creditor'].includes(account.accClass) ? 'bold' : 'normal' } },
        { content: ['debtor', 'creditor'].includes(account.accClass) ? 'Dues' : 'Paid', styles: { fontStyle: ['debtor', 'creditor'].includes(account.accClass) ? 'bold' : 'normal' } }
      ]),
      styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: 'left',
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left', minCellWidth: 25 }, // #
        1: { cellWidth: 'auto', minCellWidth: 120 }, // Account
        2: { cellWidth: 'auto', minCellWidth: 120 }, // Details
        3: { cellWidth: 'auto', halign: 'right', minCellWidth: 50 }, // Amount
        4: { cellWidth: 'auto', halign: 'left', minCellWidth: 30 }, // Status
      },
      didParseCell: function (data: any) {
        if (data.section === 'head' && data.column.index === 3) {
          data.cell.styles.halign = 'right';
        }
      },
      margin: { left: marginLeft, right: pageWidth - 370 }, // Give receipts table more allowed width
      theme: 'grid',
      pageBreak: 'avoid'
    });

    receiptEndY = doc.lastAutoTable?.finalY || receiptTableY + 60;
  }

  // Right side summary section - positioned to avoid receipts table
  const summaryX = pageWidth - marginLeft;
  const summaryLeftX = pageWidth / 2 + 120; // Start summary with good spacing from receipts table
  summaryStartY = Math.max(currentY, summaryStartY);

  // Check if we need a new page for summary section
  const summaryRequiredHeight = 80; // Estimate height needed for summary
  if (summaryStartY + summaryRequiredHeight > pageHeight - 40) {
    doc.addPage();
    summaryStartY = 30;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Aggregate amount:`, summaryLeftX, summaryStartY);
  doc.text(formatNumber(totalSubTotal), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 12;

  doc.text(`Cgst:`, summaryLeftX, summaryStartY);
  doc.text(formatNumber(totalCGST), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 12;

  doc.text(`Sgst:`, summaryLeftX, summaryStartY);
  doc.text(formatNumber(totalSGST), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 12;

  doc.text(`Igst:`, summaryLeftX, summaryStartY);
  doc.text(formatNumber(totalIGST), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total amount:`, summaryLeftX, summaryStartY);
  doc.text(formatNumber(totalAmount), summaryX, summaryStartY, { align: 'right' });

  // Amount in words and final amount payable - ensure no overlap
  currentY = Math.max(receiptEndY, summaryStartY) + 28;

  // Check if we need a new page for amount in words section
  const amountWordsRequiredHeight = 60; // Estimate height needed
  if (currentY + amountWordsRequiredHeight > pageHeight - 40) {
    doc.addPage();
    currentY = 30;
  }

  const amountWords = Utils.toWordsFromAmount(totalAmount);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const amountWordsText = `Rs ${amountWords}.`;
  const amountWordsLines = doc.splitTextToSize(amountWordsText, pageWidth / 2 - 10);
  doc.text(amountWordsLines, marginLeft, currentY);

  // Authorised signatory on the same line as amount in words
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorised signatory', summaryX, currentY, { align: 'right' });
  currentY += amountWordsLines.length * 10;

  // Add page numbers at the end
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginLeft, 20, { align: 'right' });
  }

  const blob = doc.output('blob');
  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}