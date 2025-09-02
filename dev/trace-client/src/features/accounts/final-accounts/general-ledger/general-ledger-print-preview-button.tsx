import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { IconPreview1 } from "../../../../controls/icons/icon-preview1";
import { AccTranType } from "./general-ledger";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import { shallowEqual, useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store";
import { selectCompSwitchStateFn } from "../../../../controls/redux-components/comp-slice";
import { useState } from "react";

export function GeneralLedgerPrintPreviewButton({
    accountName,
    accClass,
    data,
    instance,
    nonSummaryData
}: PropsType) {
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance), shallowEqual)
    const { branchName, currentDateFormat, currentFinYear } = useUtilsInfo()
    const [isHideDetails, setIsHideDetails] = useState(false);
    const classLogic: any = {
        'purchase': 'Purchase Ledger',
        'sale': 'Sale Ledger',
        'bank': 'Bank Book',
        'cash': 'Cash Book'
    }
    const mainTitle = classLogic[accClass] || 'Ledger Accounts'

    return (<div className="flex flex-col items-center px-2 pt-1 pb-2 border-2 border-amber-500 rounded gap-1">

        <TooltipComponent content='Print Preview'>
            <button onClick={async () => {
                generateLedgerPdf({
                    accountName: accountName,
                    branchName: branchName || '',
                    isAllBranches,
                    currentDateFormat,
                    data: data,
                    fromDate: currentFinYear?.startDate || '',
                    toDate: currentFinYear?.endDate || '',
                    mainTitle,
                    isHideDetails,
                    nonSummaryData
                })
            }}>
                <IconPreview1 className="w-8 h-8 text-blue-500" />
            </button>
        </TooltipComponent>
        <TooltipComponent content="Hide Details">
            <label className="flex items-center mt-1 text-xs cursor-pointer gap-1">
                <input
                    className="cursor-pointer"
                    type="checkbox"
                    checked={isHideDetails}
                    onChange={(e) => setIsHideDetails(e.target.checked)}
                />
                Hide
            </label>
        </TooltipComponent>
    </div>)
}

function generateLedgerPdf({
    accountName,
    branchName,
    isAllBranches,
    currentDateFormat,
    data,
    fromDate,
    toDate,
    mainTitle,
    isHideDetails,
    nonSummaryData
}: PdfPropsType) {
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
    const formattedTranDate = (tranDate: string) => format(tranDate, currentDateFormat)

    const companyInfo: UnitInfoType = Utils.getUnitInfo() || {}
    const company = {
        name: companyInfo.unitName,
        branchName: isAllBranches ? `Branch: All Branches` : `Branch: ${branchName}`,
        address: `${companyInfo.address1?.trim()} ${companyInfo.address1?.trim()}`,
        gstin: `GSTIN: ${companyInfo.gstin}`,
        email: `Emai: ${companyInfo.email}`
    }

    // Use Decimal for summing to avoid floating-point issues
    const debitTotal = nonSummaryData.reduce(
        (sum, row) => sum.plus(new Decimal(row.debit || 0)),
        new Decimal(0)
    );

    const creditTotal = nonSummaryData.reduce(
        (sum, row) => sum.plus(new Decimal(row.credit || 0)),
        new Decimal(0)
    );
    const closingBalance = debitTotal.minus(creditTotal);
    const closingLabel = closingBalance.greaterThanOrEqualTo(0) ? 'Dr' : 'Cr';
    const closingAmount = `${formatAmount(closingBalance.abs().toNumber())} ${closingLabel}`;
    const totalRows = nonSummaryData.length;
    const getInfo = (row: any) => {
        let ret = ''
        if (isHideDetails) {
            ret = [(isAllBranches ? row.branchCode : ''), row.userRefNo?.trim()]
                .filter(Boolean)
                .join(' | ')
        } else {
            ret = [(isAllBranches ? row.branchCode : ''), row.instrNo?.trim(), row.userRefNo?.trim(), row.remarks?.trim(), row.lineRefNo?.trim(), row.lineRemarks?.trim()]
                .filter(Boolean)
                .join(' | ')
        }
        return ret
    };

    cursorY += 80; // This is for first page only

    // Table
    autoTable(doc, {
        startY: cursorY,
        head: [[
            'Date', 'Reference', 'Type', 'Account', 'Debit', 'Credit', 'Info'
        ]],
        body: data.map((row: AccTranType) => [
            formattedTranDate(row.tranDate),
            row.autoRefNo || '',
            row.tranType || '',
            row.otherAccounts || '',
            row.debit ? formatAmount(row.debit) : '',
            row.credit ? formatAmount(row.credit) : '',
            getInfo(row),
        ]),
        columnStyles: {
            0: { cellWidth: 50 },  // Date
            1: { cellWidth: 105.28 },  // Reference
            2: { cellWidth: 50 },  // Type
            3: { cellWidth: 110 },  // Account
            4: { cellWidth: 60, halign: 'right' }, // Debit
            5: { cellWidth: 60, halign: 'right' },  // Credit
            6: { cellWidth: 120, halign: 'left' }, // Info
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
        margin: { left: xMargin, right: xMargin, top: 120 },// This is for all pages except 1st page
        didDrawCell: function (data) {
            if (data.section === 'body' && data.row.index === 0 && data.column.index === 0) {
                const offset = 4;
                data.cell.y += offset; // move the first body row down
                data.row.height += offset; // extend row height
            }
        },
        didDrawPage: function (data) {
            const table: any = data.table;
            let topY = 40;

            // 1. Main Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(mainTitle, pageWidth / 2, topY, { align: 'center' });
            topY += 20;

            // 2. Header Info
            doc.setFontSize(10);

            // LEFT HEADER BLOCK
            const left = [
                { text: company.name, bold: true, size: 12 },
                { text: company.branchName, bol: false, size: 9 },
                { text: company.address, bold: false, size: 9 },
                { text: company.gstin || '', bold: false, size: 9 },
                { text: company.email || '', bold: false, size: 9 }
            ];

            left.forEach((line, i) => {
                if (line.text) {
                    doc.setFontSize(line.size);
                    doc.setFont('helvetica', line.bold ? 'bold' : 'normal');
                    doc.text(line.text, xMargin, topY + i * 12);
                }
            });

            // RIGHT HEADER BLOCK
            const right = [
                { text: `Account: ${accountName}`, bold: true, size: 11 },
                { text: `Period: ${formattedFrom} to ${formattedTo}`, bold: true, size: 9 }
            ];

            right.forEach((line, i) => {
                if (line.text.trim()) {
                    doc.setFontSize(line.size);
                    doc.setFont('helvetica', line.bold ? 'bold' : 'normal');
                    doc.text(line.text, pageWidth - xMargin, topY + i * 12, { align: 'right' });
                }
            });

            // 3. Table Header Lines
            const headerY = table.head[0].cells[0].y;
            const headerHeight = table.head[0].height || 20;
            const topLineY = headerY - 2;
            const bottomLineY = headerY + headerHeight - 1;

            doc.setDrawColor(0);  // Black
            doc.setLineWidth(0.75);
            doc.line(startX, topLineY, endX, topLineY);       // Top line
            doc.line(startX, bottomLineY, endX, bottomLineY); // Bottom line
        },
        didParseCell: function (data: any) {
            const { cell, column, section } = data;

            // Highlight summary rows
            const isSummaryRow =
                section === 'body' &&
                data.row.raw &&
                typeof data.row.raw[1] === 'string' &&
                data.row.raw[1].toLowerCase().includes('summary');

            if (section === 'body') {
                // Light gray horizontal line for all rows
                cell.styles.lineWidth = { top: 0, right: 0, bottom: 0.1, left: 0 };
                cell.styles.lineColor = [235, 235, 235];

                if (isSummaryRow) {
                    // Apply special style for summary row
                    cell.styles.fontStyle = 'bold';
                    cell.styles.fillColor = [245, 245, 245]; // light gray background
                    cell.styles.textColor = [0, 0, 120];     // navy text
                }
            }

            // Align headers of Debit/Credit
            if (section === 'head' && (column.index === 4 || column.index === 5)) {
                cell.styles.halign = 'right';
            }
        }
    });

    // Totals & Closing Line
    const finalY = (doc as any).lastAutoTable.finalY || cursorY + 20;
    const lineY = finalY + 20;
    const summaryHeight = 16;

    const summaryText = `Total Rows: ${totalRows}    Total Debits: ${formatAmount(debitTotal.toNumber())}    Total Credits: ${formatAmount(creditTotal.toNumber())}    Closing Balance: ${closingAmount}`;

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

    // Open in new tab instead of saving
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}

type PropsType = {
    accountName: string;
    accClass: string;
    data: AccTranType[];
    instance: string;
    nonSummaryData: AccTranType[];
}

type PdfPropsType = {
    accountName: string;
    branchName: string;
    isAllBranches: boolean;
    currentDateFormat: string;
    data: AccTranType[];
    fromDate: string;
    toDate: string;
    mainTitle: string;
    isHideDetails: boolean;
    nonSummaryData: AccTranType[]
};