import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalePurchaseEditDataType } from '../../../../utils/global-types-interfaces-enums';
import { UnitInfoType, Utils } from '../../../../utils/utils';
import { format } from 'date-fns';
import { ShippingInfoType } from './all-sales';

export function generateSalesInvoicePDF(invoiceData: SalePurchaseEditDataType, branchName: string, currentDateFormat: string) {
  // const doc = new jsPDF({ unit: 'pt', format: [420, 595], orientation: 'portrait' }); // Half A4 width
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' }); // Half A4 width
  const marginLeft = 25;
  const pageWidth = doc.internal.pageSize.getWidth();
  // const pageHeight = doc.internal.pageSize.getHeight();
  const rightAlignX = pageWidth - marginLeft;
  // const lineSpacing = 10;
  const { tranH, billTo, /*businessContacts,*/ salePurchaseDetails, tranD, extGstTranD } = invoiceData;
  const companyInfo: UnitInfoType = Utils.getUnitInfo() || {};

  // Company info from businessContacts (this is the selling company)
  const company = {
    name: companyInfo.unitName || 'This Company Pvt Ltd',
    branchName: branchName || '',
    address: `${companyInfo.address1?.trim() || ''} ${companyInfo.address2?.trim() || ''} Pin: ${companyInfo.pin}`,
    gstin: companyInfo.gstin || '',
    phone: companyInfo.mobileNumber || '',
    email: companyInfo.email || '',
    website: companyInfo.webSite || '',
    stateCode: companyInfo.state || ''
  };

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

  // Company Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(company.name, marginLeft, currentY);
  currentY += 12;

  // GSTIN
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`GSTIN ${company.gstin}`, marginLeft, currentY);
  currentY += 10;

  // Address
  doc.text(company.address, marginLeft, currentY);
  currentY += 10;

  // Contact details
  doc.text(`Ph: ${company.phone} email: ${company.email} ${company.website ? `Web: ${company.website}` : ''}`, marginLeft, currentY);
  currentY += 10;

  // State
  doc.text(`State code: ${company.stateCode}`, marginLeft, currentY);

  // Tax Invoice header (right side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TAX INVOICE', rightAlignX, 30, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Original for recipient', rightAlignX, 38, { align: 'right' });

  // Invoice details (right side)
  let invoiceY = 50;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #: ${tranH.autoRefNo}`, rightAlignX, invoiceY, { align: 'right' });
  invoiceY += 11;
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${format(tranH.tranDate, currentDateFormat)}`, rightAlignX, invoiceY, { align: 'right' });
  invoiceY += 11;
  doc.text('Type: Sale', rightAlignX, invoiceY, { align: 'right' });

  // Ensure currentY is below company header
  currentY = Math.max(currentY, invoiceY + 20);

  // Add spacing before customer details
  // currentY += 10;

  // Customer Details and Shipping Address (side by side)
  const leftColumnX = marginLeft;
  const rightColumnX = pageWidth / 2 + 5;
  const maxColumnWidth = (pageWidth / 2) - 25; // Prevent text overflow
  let leftY = currentY;
  let rightY = currentY;

  // Customer Details (left side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Customer Details', leftColumnX, leftY);
  leftY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
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
    const addressLines = doc.splitTextToSize(billToAddress, maxColumnWidth);
    doc.text(addressLines, leftColumnX, leftY);
    leftY += addressLines.length * 10;
  }

  // if (billTo?.mobileNumber) {
  //   doc.text(`Ph: ${billTo.mobileNumber}`, leftColumnX, leftY);
  //   leftY += 10;
  // }

  // if (billTo?.email) {
  //   const emailLines = doc.splitTextToSize(`email: ${billTo.email}`, maxColumnWidth);
  //   doc.text(emailLines, leftColumnX, leftY);
  //   leftY += emailLines.length * 10;
  // }

  const placeOfSupplyText = `Place of supply: ${company.state} State Code: ${company.stateCode}`;
  const placeLines = doc.splitTextToSize(placeOfSupplyText, maxColumnWidth);
  doc.text(placeLines, leftColumnX, leftY);
  leftY += placeLines.length * 10;

  if (tranH.remarks) {
    const remarkLines = doc.splitTextToSize(`Remarks: ${tranH.remarks}`, maxColumnWidth);
    doc.text(remarkLines, leftColumnX, leftY);
    leftY += remarkLines.length * 10;
  }

  // Account info if available
  const autoSubledgerAccount = tranD.find(item => item.dc === 'D' && item.isParentAutoSubledger);
  if (autoSubledgerAccount) {
    const accountText = `AutoSubledger Account: ${autoSubledgerAccount.accName || ''}`;
    const accountLines = doc.splitTextToSize(accountText, maxColumnWidth);
    doc.text(accountLines, leftColumnX, leftY);
    leftY += accountLines.length * 10;
  }

  // Shipping Address (right side) - if different from billing
  const shippingInfo: ShippingInfoType = tranH?.jData?.shipTo;
  if (shippingInfo) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Shipping Address', rightColumnX, rightY);
    rightY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    if (shippingInfo.name) {
      const nameLines = doc.splitTextToSize(shippingInfo.name, maxColumnWidth);
      doc.text(nameLines, rightColumnX, rightY);
      rightY += nameLines.length * 10;
    }

    if (shippingInfo.address1) {
      const shippingLines = doc.splitTextToSize(shippingInfo.address1, maxColumnWidth);
      doc.text(shippingLines, rightColumnX, rightY);
      rightY += shippingLines.length * 10;
    }

    if (shippingInfo.mobileNumber) {
      doc.text(`Ph: ${shippingInfo.mobileNumber}`, rightColumnX, rightY);
      rightY += 10;
    }

    if (shippingInfo.email) {
      const emailLines = doc.splitTextToSize(`email: ${shippingInfo.email}`, maxColumnWidth);
      doc.text(emailLines, rightColumnX, rightY);
      rightY += emailLines.length * 10;
    }

    if (shippingInfo.state) {
      doc.text(`State: ${shippingInfo.state}`, rightColumnX, rightY);
      rightY += 10;
    }

    if (shippingInfo.country) {
      doc.text(`Country: ${shippingInfo.country}`, rightColumnX, rightY);
      rightY += 10;
    }
  }

  currentY = Math.max(leftY, rightY) + 20;

  // Items table
  const tableStartY = currentY + 5;
  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Items', 'Qty', 'Rate', 'Disc', 'Aggregate', 'Tax amount (%)', 'Amount']],
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
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      halign: 'center',
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' }, // #
      1: { cellWidth: 150 }, // Items
      2: { cellWidth: 25, halign: 'right' }, // Qty
      3: { cellWidth: 35, halign: 'right' }, // Rate
      4: { cellWidth: 25, halign: 'right' }, // Disc
      5: { cellWidth: 40, halign: 'right' }, // Aggregate
      6: { cellWidth: 45, halign: 'right' }, // Tax amount (%)
      7: { cellWidth: 40, halign: 'right' }, // Amount
    },
    margin: { left: marginLeft, right: marginLeft },
    theme: 'grid',
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Receipts', marginLeft, currentY);

    const receiptTableY = currentY + 8;

    // Receipts table
    autoTable(doc, {
      startY: receiptTableY,
      head: [['#', 'Info', 'Instrument', 'Remarks', 'Amount']],
      body: receiptDebitAccounts.map((account, i) => [
        `${i + 1}`,
        account.accName || 'undefined',
        account.instrNo || '',
        account.remarks || '',
        { content: formatNumber(account.amount || 0), styles: { halign: 'right' as const } }
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: 'center',
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' }, // #
        1: { cellWidth: 70 }, // Info
        2: { cellWidth: 45 }, // Instrument
        3: { cellWidth: 50 }, // Remarks
        4: { cellWidth: 40, halign: 'right' }, // Amount
      },
      margin: { left: marginLeft, right: pageWidth / 2 + 10 }, // Limit to left half
      theme: 'grid',
      pageBreak: 'avoid'
    });

    receiptEndY = doc.lastAutoTable?.finalY || receiptTableY + 60;
  }

  // Right side summary section - positioned to avoid receipts table
  const summaryX = pageWidth - 15;
  summaryStartY = Math.max(currentY, summaryStartY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Aggregate amount:`, summaryX - 120, summaryStartY);
  doc.text(formatNumber(totalSubTotal), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 10;

  doc.text(`Cgst:`, summaryX - 120, summaryStartY);
  doc.text(formatNumber(totalCGST), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 10;

  doc.text(`Sgst:`, summaryX - 120, summaryStartY);
  doc.text(formatNumber(totalSGST), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 10;

  doc.text(`Igst:`, summaryX - 120, summaryStartY);
  doc.text(formatNumber(totalIGST), summaryX, summaryStartY, { align: 'right' });
  summaryStartY += 10;

  doc.setFont('helvetica', 'bold');
  doc.text(`Total amount:`, summaryX - 120, summaryStartY);
  doc.text(formatNumber(totalAmount), summaryX, summaryStartY, { align: 'right' });

  // Amount in words and final amount payable - ensure no overlap
  currentY = Math.max(receiptEndY, summaryStartY) + 20;
  const amountWords = Utils.toWordsFromAmount(totalAmount);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const amountWordsText = `Rs ${amountWords} only.`;
  const amountWordsLines = doc.splitTextToSize(amountWordsText, pageWidth / 2 - 10);
  doc.text(amountWordsLines, marginLeft, currentY);
  currentY += amountWordsLines.length * 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Amount payable: ${formatNumber(totalAmount)}`, summaryX, currentY, { align: 'right' });

  // Signature section - ensure adequate spacing
  currentY += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Authorised signatory', marginLeft, currentY);
  currentY += 10;
  doc.text('Computer generated invoice', marginLeft, currentY);
  currentY += 10;
  doc.text('(No signature required)', marginLeft, currentY);

  const blob = doc.output('blob');
  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}