import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Add this if needed for TypeScript to recognize `lastAutoTable`
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export function GenerateLedger2Pdf(data: any[], accountName: string) {
  const doc = new jsPDF({
    format: 'a4',
  });

  // Header
  doc.setFontSize(10);
  doc.text("Ledger Account", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Account: ${accountName}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 30);

  doc.setFontSize(8);
  // Table
  autoTable(doc, {
    startY: 40,
    tableWidth: 'wrap',
    head: [["Date", "Ref", "Account", "Debit", "Credit", "Type", "Info"]],
    styles: {
      // columnWidth:'wrap'
      fontSize: 8,
      cellWidth: 'wrap'
    },
    margin: { top: 20, bottom: 20, left: 10, right: 10 },
    // columns: [
    //   { header: 'Date', dataKey: 'tranDate' },
    //   { header: 'Ref', dataKey: 'autoRefNo' },
    //   { header: 'Account', dataKey: 'otherAccounts' },
    //   { header: 'Debit', dataKey: 'debit' },
    //   { header: 'Credit', dataKey: 'credit', styles: { halign: 'right' } }
    // ],
    columnStyles: {
      0: { cellWidth: 20 },  // Date
      1: { cellWidth: 30 },  // Ref
      2: { cellWidth: 35 },  // Account
      3: { cellWidth: 20, halign: 'right' },  // Debit
      4: { cellWidth: 20, halign: 'right' },  // Credit
      5: { cellWidth: 15 },  // Type
      6: { cellWidth: 50 }   // Info
    },
    body: data.map((row) => [
      row.tranDate,
      row.autoRefNo,
      row.otherAccounts,
      row.debit ? row.debit.toFixed(2) : "",
      row.credit ? row.credit.toFixed(2) : "",
      row.tranType,
      [row.branchCode, row.instrNo, row.userRefNo, row.remarks, row.lineRefNo, row.lineRemarks].filter(Boolean).join(" | "),
    ]),
  });

  // Footer or Closing balance
  const finalY = doc.lastAutoTable?.finalY || 270;
  doc.setFontSize(10);
  doc.text("Closing Balance: ₹0.00", 14, finalY + 10);

  // Open in new tab instead of saving
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
