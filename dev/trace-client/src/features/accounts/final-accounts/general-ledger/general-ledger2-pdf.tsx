import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

export function GeneralLedger2Pdf({
  data,
  accountName,
  fromDate,
  toDate,
  partyAddress = '',
  company = {
    name: 'Your Company Name Pvt. Ltd.',
    address: '123 Business Road, Kolkata, WB 700001',
    gstin: 'GSTIN: 19ABCDE1234F1Z5',
    email: 'contact@yourcompany.com'
  }
}: {
  data: any[];
  accountName: string;
  fromDate: string;
  toDate: string;
  partyAddress?: string;
  company?: {
    name: string;
    address: string;
    gstin?: string;
    email?: string;
  };
}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const debitTotal = data.reduce((sum, row) => sum + (row.debit || 0), 0);
  const creditTotal = data.reduce((sum, row) => sum + (row.credit || 0), 0);
  const closingBalance = debitTotal - creditTotal;
  const closingLabel = closingBalance >= 0 ? 'Dr' : 'Cr';
  const closingAmount = `${formatAmount(Math.abs(closingBalance))} ${closingLabel}`;

  const formattedFrom = format(new Date(fromDate), 'do MMMM yyyy');
  const formattedTo = format(new Date(toDate), 'do MMMM yyyy');

  // Header
  doc.setFontSize(16);
  doc.text('Ledger Account', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.text(company.name, 14, 25);
  doc.text(company.address, 14, 30);
  if (company.gstin) doc.text(company.gstin, 14, 35);
  if (company.email) doc.text(company.email, 14, 40);

  doc.text(`Account: ${accountName}`, pageWidth - 14, 25, { align: 'right' });
  if (partyAddress) doc.text(partyAddress, pageWidth - 14, 30, { align: 'right' });
  doc.text(`Period: ${formattedFrom} to ${formattedTo}`, pageWidth - 14, 35, { align: 'right' });

  // Table
  const columns = [
    { header: 'Date', dataKey: 'tranDate' },
    { header: 'Ref', dataKey: 'autoRefNo' },
    { header: 'Account', dataKey: 'otherAccounts' },
    { header: 'Debit', dataKey: 'debit' },
    { header: 'Credit', dataKey: 'credit' },
    { header: 'Type', dataKey: 'tranType' },
    { header: 'Info', dataKey: 'info' }
  ];

  const rows = data.map((row) => ({
    tranDate: row.tranDate || '',
    autoRefNo: row.autoRefNo || '',
    otherAccounts: row.otherAccounts || '',
    debit: row.debit ? formatAmount(row.debit) : '',
    credit: row.credit ? formatAmount(row.credit) : '',
    tranType: row.tranType || '',
    info: [row.branchCode, row.instrNo, row.userRefNo, row.remarks, row.lineRefNo, row.lineRemarks].filter(Boolean).join(' | ')
  }));

  (doc as any).autoTable({
    head: [columns.map(c => c.header)],
    body: rows.map(row => columns.map(c => row[c.dataKey])),
    startY: 45,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0 },
    margin: { top: 10, bottom: 20 },
    didDrawPage: (data: any) => {
      doc.setFontSize(8);
      const page = doc.internal.getNumberOfPages();
      doc.text(`Page ${page}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
  });

  // Totals
  const endY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(9);
  doc.text(`Total Debits: ${formatAmount(debitTotal)}`, 14, endY);
  doc.text(`Total Credits: ${formatAmount(creditTotal)}`, 70, endY);
  doc.text(`Closing Balance: ${closingAmount}`, pageWidth - 14, endY, { align: 'right' });

  doc.save(`ledger-${accountName}.pdf`);
}

function formatAmount(amount: number) {
  return new Decimal(amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
