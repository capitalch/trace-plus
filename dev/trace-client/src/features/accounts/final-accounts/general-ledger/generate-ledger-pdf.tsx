// mm 210,297
//pt 595.28, 841.89

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

type Props = {
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
};

export function generateLedgerPdf({
    data,
    accountName,
    fromDate,
    toDate,
    partyAddress = '',
    company = {
        name: "Your Company Name Pvt. Ltd.",
        address: "123 Business Road, Kolkata, WB 700001",
        gstin: "GSTIN: 19ABCDE1234F1Z5",
        email: "contact@yourcompany.com"
    }
}: Props) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const xMargin = 20;
    let cursorY = 40;
    const startX = xMargin;
    const endX = pageWidth - xMargin;

    const formatAmount = (amt: number) =>
        new Decimal(amt).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const formattedFrom = format(new Date(fromDate), 'dd MMM yyyy');
    const formattedTo = format(new Date(toDate), 'dd MMM yyyy');

    const debitTotal = data.reduce((sum, row) => sum + (row.debit || 0), 0);
    const creditTotal = data.reduce((sum, row) => sum + (row.credit || 0), 0);
    const closingBalance = debitTotal - creditTotal;
    const closingLabel = closingBalance >= 0 ? 'Dr' : 'Cr';
    const closingAmount = `${formatAmount(Math.abs(closingBalance))} ${closingLabel}`;

    const getInfo = (row: any) =>
        [row.branchCode, row.instrNo?.trim(), row.userRefNo?.trim(), row.remarks?.trim(), row.lineRefNo?.trim(), row.lineRemarks?.trim()]
            .filter(Boolean)
            .join(' | ');

    cursorY += 70;

    // Table
    autoTable(doc, {
        startY: cursorY,
        head: [[
            'Date', 'Reference', 'Type', 'Account', 'Info', 'Debit', 'Credit'
        ]],
        body: data.map(row => [
            row.tranDate || '',
            row.autoRefNo || '',
            row.tranType || '',
            row.otherAccounts || '',
            getInfo(row),
            row.debit ? formatAmount(row.debit) : '',
            row.credit ? formatAmount(row.credit) : ''
        ]),
        columnStyles: {
            0: { cellWidth: 55 },  // Date
            1: { cellWidth: 100 },  // Reference
            2: { cellWidth: 50 },  // Type
            3: { cellWidth: 110 },  // Account
            4: { cellWidth: 120 }, // Info
            5: { cellWidth: 60, halign: 'right' }, // Debit
            6: { cellWidth: 60, halign: 'right' }  // Credit
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            fontStyle: 'bold',
            cellPadding: { top: 6, right: 4, bottom: 8, left: 4 } // increase vertical space
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        theme: 'plain',
        margin: { left: xMargin, right: xMargin, top: 110 },
        didDrawCell: function (data) {
            if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) {
                const offset = 4;
                data.cell.y += offset; // move the first body row down
                data.row.height += offset; // extend row height
            }
        },
        didDrawPage: function (data) {
            const table: any = data.table;

            let topY = 40
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Ledger Account', pageWidth / 2, topY, { align: 'center' });
            topY += 20
            // 1. Draw company and account info at top

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const left = [
                company.name,
                company.address,
                company.gstin || '',
                company.email || ''
            ];

            const right = [
                `Account: ${accountName}`,
                partyAddress,
                `Period: ${formattedFrom} to ${formattedTo}`
            ];

            left.forEach((line, i) => {
                if (line) doc.text(line, xMargin, topY + i * 12);
            });
            right.forEach((line, i) => {
                if (typeof line === 'string' && line.trim()) {
                    doc.text(line, pageWidth - xMargin, topY + i * 12, { align: 'right' });
                }
            });

            // 2. Draw table header lines
            const headerY = table.head[0].cells[0].y;
            const headerHeight = table.head[0].height || 20;
            const topLineY = headerY - 2;
            const bottomLineY = headerY + headerHeight - 1;

            doc.setDrawColor(0);  // Black
            doc.setLineWidth(0.75);
            doc.line(startX, topLineY, endX, topLineY);       // Top line
            doc.line(startX, bottomLineY, endX, bottomLineY); // Bottom line
        },
        didParseCell: function (data) { // to show light gray horizontal lines for rows
            if (data.section === 'body') {
                data.cell.styles.lineWidth = { top: 0, right: 0, bottom: 0.1, left: 0 };
                data.cell.styles.lineColor = [240, 240, 240];
            }
        }
    });

    // Totals & Closing Line
    const totalRows = data.length;
    const finalY = (doc as any).lastAutoTable.finalY || cursorY + 20;
    const lineY = finalY + 20;
    const summaryHeight = 16;

    const summaryText = `Total Rows: ${totalRows}    Total Debits: ${formatAmount(debitTotal)}    Total Credits: ${formatAmount(creditTotal)}    Closing Balance: ${closingAmount}`;

    doc.setLineWidth(0.75);
    doc.setDrawColor(0);

    // Top line
    doc.line(startX, lineY, endX, lineY);

    // Summary line
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(summaryText, pageWidth / 2, lineY + summaryHeight, { align: 'center' });

    // Bottom line
    doc.line(startX, lineY + summaryHeight + 8, endX, lineY + summaryHeight + 4);

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
    }

    //   doc.save('ledger.pdf');
    // Open in new tab instead of saving
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}
