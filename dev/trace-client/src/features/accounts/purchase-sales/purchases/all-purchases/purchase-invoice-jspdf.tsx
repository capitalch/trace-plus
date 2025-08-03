import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalePurchaseEditDataType } from '../../../../../utils/global-types-interfaces-enums';
import { UnitInfoType, Utils } from '../../../../../utils/utils';

export function generatePurchaseInvoicePDF(invoiceData: SalePurchaseEditDataType, branchName: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

  const marginLeft = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightAlignX = pageWidth - marginLeft;
  const lineSpacing = 12;

  const { tranH, businessContacts, salePurchaseDetails } = invoiceData;
  const companyInfo: UnitInfoType = Utils.getUnitInfo() || {};
  const company = {
    name: companyInfo.unitName || 'My Company Pvt Ltd',
    branchName: branchName || '',
    address: `${companyInfo.address1?.trim() || ''} ${companyInfo.address2?.trim() || ''}`,
    gstin: `GSTIN: ${companyInfo.gstin || ''}`,
    email: `Email: ${companyInfo.email || ''}`
  };
  const addr = businessContacts?.jAddress?.[0] || {};

  let y = 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Supplier Details', marginLeft, y);
  doc.setFont('helvetica', 'normal');
  y += lineSpacing;
  doc.text(`${businessContacts?.contactName || ''}`, marginLeft, y);
  y += lineSpacing;
  doc.text(`${addr.address1 || ''}, ${addr.address2 || ''}`, marginLeft, y);
  y += lineSpacing;
  doc.text(`${addr.city || ''} - ${addr.pin || ''}, ${addr.state || ''}`, marginLeft, y);
  y += lineSpacing;
  doc.text(`Email: ${businessContacts?.email || ''}`, marginLeft, y);
  y += lineSpacing;
  doc.text(`Phone: ${businessContacts?.landPhone || ''}`, marginLeft, y);
  y += lineSpacing;
  doc.text(`GSTIN: ${businessContacts?.gstin || ''}`, marginLeft, y);

  let invoiceY = 40;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Info', rightAlignX, invoiceY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  invoiceY += lineSpacing;
  doc.text(`Invoice No: ${tranH.userRefNo}`, rightAlignX, invoiceY, { align: 'right' });
  invoiceY += lineSpacing;
  doc.text(`Auto Ref No: ${tranH.autoRefNo}`, rightAlignX, invoiceY, { align: 'right' });
  invoiceY += lineSpacing;
  doc.text(`Date: ${new Date(tranH.tranDate).toLocaleDateString()}`, rightAlignX, invoiceY, { align: 'right' });

  y += 2 * lineSpacing;
  doc.setFont('helvetica', 'bold');
  doc.text('My Company Details', marginLeft, y);
  y += lineSpacing;
  doc.setFont('helvetica', 'normal');
  doc.text(company.name, marginLeft, y);
  y += lineSpacing;
  doc.text(company.branchName, marginLeft, y);
  y += lineSpacing;
  doc.text(company.address, marginLeft, y);
  y += lineSpacing;
  doc.text(company.gstin, marginLeft, y);
  y += lineSpacing;
  doc.text(company.email, marginLeft, y);

  const tableStartY = y + 20;
  const formatNumber = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const totalQty = salePurchaseDetails.reduce((sum, item) => sum + item.qty, 0);
  const totalRate = salePurchaseDetails.reduce((sum, item) => sum + item.price, 0);
  const totalCGST = salePurchaseDetails.reduce((sum, item) => sum + item.cgst, 0);
  const totalSGST = salePurchaseDetails.reduce((sum, item) => sum + item.sgst, 0);
  const totalIGST = salePurchaseDetails.reduce((sum, item) => sum + item.igst, 0);
  const totalAmount = salePurchaseDetails.reduce((sum, item) => sum + item.amount, 0);

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      'S.No', 'Product Code', 'Description', 'HSN', 'Qty', 'Rate', 'CGST', 'SGST', 'IGST', 'Amount'
    ]],
    body: [
      ...salePurchaseDetails.map((item, index) => [
        index + 1,
        item.productCode,
        item.label,
        item.hsn,
        { content: item.qty.toString(), styles: { halign: 'right' } },
        { content: formatNumber(item.price), styles: { halign: 'right' } },
        { content: formatNumber(item.cgst), styles: { halign: 'right' } },
        { content: formatNumber(item.sgst), styles: { halign: 'right' } },
        { content: formatNumber(item.igst), styles: { halign: 'right' } },
        { content: formatNumber(item.amount), styles: { halign: 'right' } }
      ]),
      [
        { content: 'Total', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totalQty), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totalRate), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totalCGST), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totalSGST), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totalIGST), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totalAmount), styles: { halign: 'right', fontStyle: 'bold' } }
      ]
    ],
    styles: { fontSize: 8, textColor: [0, 0, 0] },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      halign: 'center'
    },
    margin: { left: marginLeft, right: marginLeft },
    theme: 'grid'
  });

  const yAfterTable = doc.lastAutoTable?.finalY || tableStartY + 100;

  // Summary Section (right aligned)
  const summaryY = yAfterTable + 16;
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', rightAlignX, summaryY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Qty: ${formatNumber(totalQty)}`, rightAlignX, summaryY + 14, { align: 'right' });
  doc.text(`Total Rate: ${formatNumber(totalRate)}`, rightAlignX, summaryY + 28, { align: 'right' });
  doc.text(`Total CGST: ${formatNumber(totalCGST)}`, rightAlignX, summaryY + 42, { align: 'right' });
  doc.text(`Total SGST: ${formatNumber(totalSGST)}`, rightAlignX, summaryY + 56, { align: 'right' });
  doc.text(`Total IGST: ${formatNumber(totalIGST)}`, rightAlignX, summaryY + 70, { align: 'right' });
  doc.text(`Total Amount: ${formatNumber(totalAmount)}`, rightAlignX, summaryY + 84, { align: 'right' });

  // Signature Section
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', rightAlignX, summaryY + 114, { align: 'right' });

  const blob = doc.output('blob');
  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}
