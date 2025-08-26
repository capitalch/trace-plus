import jsPDF from "jspdf";
import { DebitCreditNoteEditDataType } from "../../../../utils/global-types-interfaces-enums";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import { format } from "date-fns";
import autoTable from "jspdf-autotable";

// Constants for better maintainability
const PDF_CONFIG = {
    PAGE: {
        unit: 'pt' as const,
        orientation: 'landscape' as const,
        format: [595.28, 841.89 / 2] as [number, number],
        marginLeft: 25,
        marginRight: 25,
        marginBottom: 40,
    },
    FONTS: {
        normal: { family: 'helvetica', style: 'normal' } as const,
        bold: { family: 'helvetica', style: 'bold' } as const,
        italic: { family: 'helvetica', style: 'italic' } as const,
    },
    FONT_SIZES: {
        title: 14,
        normal: 10,
        small: 8,
        footer: 8,
    },
    SPACING: {
        line: 12,
        section: 20,
        buffer: 10,
        minimal: 3,
    },
    COLORS: {
        black: [0, 0, 0] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
    },
    TABLE: {
        cellPadding: 2,
        minCellHeight: 0,
        lineWidth: 0.5,
    },
    SUMMARY: {
        height: 80,
        boxHeight: 18,
        labelSpacing: 120,
        labelOffset: 45,
    }
} as const;

const TRAN_TYPE_LABELS = {
    7: 'Debit Note',
    default: 'Credit Note'
} as const;

type GenerateNotePDFProps = {
    noteData: DebitCreditNoteEditDataType;
    branchName: string;
    currentDateFormat: string;
    tranTypeId: number;
};

type PDFContext = {
    doc: jsPDF;
    currentY: number;
    pageWidth: number;
    pageHeight: number;
    halfPageWidth: number;
    rightAlignX: number;
    detailsColumnWidth: number;
};

// Utility functions
const formatNumber = (n: number): string =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits:2 });

const buildAddress = (...parts: (string | undefined)[]): string =>
    parts.filter(part => part && part.trim()).join(' ').trim();

const buildCompanyAddress = (companyInfo: UnitInfoType): string => {
    const addressParts = [
        companyInfo.address1?.trim(),
        companyInfo.address2?.trim(),
        companyInfo.pin ? `Pin: ${companyInfo.pin}` : '',
        companyInfo.state ? `State: ${companyInfo.state}` : ''
    ];
    return buildAddress(...addressParts);
};

// PDF helper functions
const initializePDFContext = (): PDFContext => {
    const doc = new jsPDF({
        unit: PDF_CONFIG.PAGE.unit,
        orientation: PDF_CONFIG.PAGE.orientation,
        format: PDF_CONFIG.PAGE.format,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const halfPageWidth = pageWidth / 2;
    const rightAlignX = pageWidth - PDF_CONFIG.PAGE.marginLeft;
    const detailsColumnWidth = halfPageWidth - 2 * PDF_CONFIG.PAGE.marginLeft;

    return {
        doc,
        currentY: PDF_CONFIG.PAGE.marginLeft,
        pageWidth,
        pageHeight,
        halfPageWidth,
        rightAlignX,
        detailsColumnWidth,
    };
};

const setFont = (
    doc: jsPDF,
    style: 'normal' | 'bold' | 'italic',
    size: number = PDF_CONFIG.FONT_SIZES.normal
): void => {
    const font = PDF_CONFIG.FONTS[style];
    doc.setFont(font.family, font.style);
    doc.setFontSize(size);
};

const addPageIfNeeded = (context: PDFContext, spaceNeeded: number): void => {
    if (context.currentY + spaceNeeded > context.pageHeight - PDF_CONFIG.PAGE.marginBottom) {
        context.doc.addPage();
        context.currentY = PDF_CONFIG.PAGE.marginLeft + 15; // Extra gap for continuation pages
    }
};

const drawText = (
    context: PDFContext,
    text: string,
    x: number,
    y: number,
    options: any = {}
): void => {
    addPageIfNeeded(context, 20);
    context.doc.text(text, x, y, options);
    context.currentY = y;
};

const drawWrappedText = (
    context: PDFContext,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    align: 'left' | 'center' | 'right' = 'left'
): number => {
    if (!text) return y;

    const lines = context.doc.splitTextToSize(text, maxWidth);
    context.doc.text(lines, x, y, { align });
    return y + lines.length * PDF_CONFIG.SPACING.line;
};

const drawRemarksWithPageBreak = (
    context: PDFContext,
    remarksText: string,
    yPos: number
): number => {
    let finalY = yPos;
    if (remarksText) {
        const remarksWidth = context.pageWidth - PDF_CONFIG.PAGE.marginLeft - PDF_CONFIG.PAGE.marginRight;
        const splitRemarks = context.doc.splitTextToSize(remarksText, remarksWidth);
        const pageBreakHeight = context.pageHeight - PDF_CONFIG.PAGE.marginBottom;

        for (let i = 0; i < splitRemarks.length; i++) {
            if (finalY + PDF_CONFIG.SPACING.line > pageBreakHeight) {
                context.doc.addPage();
                finalY = PDF_CONFIG.PAGE.marginLeft + 15; // Extra gap for continuation pages
            }
            context.doc.text(splitRemarks[i], PDF_CONFIG.PAGE.marginLeft, finalY);
            finalY += PDF_CONFIG.SPACING.line;
        }
    }
    return finalY;
};

const drawTitle = (context: PDFContext, title: string): void => {
    setFont(context.doc, 'bold', PDF_CONFIG.FONT_SIZES.title);
    drawText(context, title, context.pageWidth / 2, context.currentY + PDF_CONFIG.SPACING.line, { align: 'center' });
    context.currentY = PDF_CONFIG.PAGE.marginLeft + 32; // Fixed position for details section (40 + 32 = 72)
};

const drawCompanyDetails = (
    context: PDFContext,
    companyInfo: UnitInfoType,
    branchName: string
): number => {
    const detailsTopY = context.currentY;
    let leftY = detailsTopY;

    const company = {
        name: companyInfo.unitName || 'This Company Pvt Ltd',
        branchName: branchName || '',
        address: buildCompanyAddress(companyInfo),
        gstin: `GSTIN: ${companyInfo.gstin || ''} Email: ${companyInfo.email || ''}`,
    };

    setFont(context.doc, 'bold');
    //   context.doc.text('Company Details', PDF_CONFIG.PAGE.marginLeft, leftY);
    //   leftY += PDF_CONFIG.SPACING.line;
    //   setFont(context.doc, 'normal');
    leftY = drawWrappedText(context, company.name, PDF_CONFIG.PAGE.marginLeft, leftY, context.detailsColumnWidth);
    if (company.branchName) {
        leftY = drawWrappedText(context, company.branchName, PDF_CONFIG.PAGE.marginLeft, leftY, context.detailsColumnWidth);
    }
    leftY = drawWrappedText(context, company.address, PDF_CONFIG.PAGE.marginLeft, leftY, context.detailsColumnWidth);
    leftY = drawWrappedText(context, company.gstin, PDF_CONFIG.PAGE.marginLeft, leftY, context.detailsColumnWidth);

    return leftY + PDF_CONFIG.SPACING.line;
};

const drawPartyDetails = (
    context: PDFContext,
    businessContacts: any
): number => {
    const detailsTopY = context.currentY;
    let rightY = detailsTopY;
    const addr = businessContacts?.jAddress?.[0] || {};

    setFont(context.doc, 'bold');
    context.doc.text('Party Details', context.rightAlignX, rightY, { align: 'right' });
    rightY += PDF_CONFIG.SPACING.line;

    setFont(context.doc, 'normal');
    const partyDetails = [
        businessContacts?.accName || '',
        buildAddress(addr.address1, addr.address2),
        buildAddress(addr.city, addr.pin ? `- ${addr.pin}` : '', addr.state ? `, ${addr.state}` : ''),
        businessContacts?.email ? `Email: ${businessContacts.email}` : '',
        businessContacts?.landPhone ? `Phone: ${businessContacts.landPhone}` : '',
        businessContacts?.gstin ? `GSTIN: ${businessContacts.gstin}` : ''
    ];

    partyDetails.forEach(detail => {
        if (detail) {
            rightY = drawWrappedText(context, detail, context.rightAlignX, rightY, context.detailsColumnWidth, 'right');
        }
    });

    return rightY + PDF_CONFIG.SPACING.line;
};

const drawNoteInfo = (
    context: PDFContext,
    tranH: any,
    currentDateFormat: string,
    title: string
): void => {
    setFont(context.doc, 'bold');
    context.doc.text(`${title} Info`, PDF_CONFIG.PAGE.marginLeft, context.currentY);
    context.currentY += PDF_CONFIG.SPACING.line;

    setFont(context.doc, 'normal');

    // First row: Date and Ref No
    const dateText = `Date: ${format(tranH.tranDate, currentDateFormat)}`;
    const autoRefText = `Ref No: ${tranH.autoRefNo}`;

    setFont(context.doc, 'bold');
    context.doc.text(autoRefText, PDF_CONFIG.PAGE.marginLeft, context.currentY);
    context.currentY += PDF_CONFIG.SPACING.line;
    setFont(context.doc, 'normal');
    context.doc.text(dateText, PDF_CONFIG.PAGE.marginLeft, context.currentY);
    context.currentY += PDF_CONFIG.SPACING.line;

    // Second row: User Ref No
    context.doc.text(`User Ref No: ${tranH.userRefNo}`, PDF_CONFIG.PAGE.marginLeft, context.currentY);
    context.currentY += PDF_CONFIG.SPACING.line;

    // Remarks (if present)
    if (tranH.remarks) {
        const remarksText = `Remarks: ${tranH.remarks}`;
        context.currentY = drawRemarksWithPageBreak(context, remarksText, context.currentY);
    }

    context.currentY += PDF_CONFIG.SPACING.buffer;
};

const drawTable = (context: PDFContext, noteData: DebitCreditNoteEditDataType): void => {
    const { tranD, extGstTranD } = noteData;
    const tableStartY = context.currentY + PDF_CONFIG.SPACING.buffer;
    const amount = tranD?.[0]?.amount || 0
    const cgst = extGstTranD?.cgst || 0
    const sgst = extGstTranD?.sgst || 0
    const igst = extGstTranD?.igst || 0
    const gstRate = extGstTranD?.rate || 0
    const hsn = extGstTranD?.hsn || ''
    const descr = tranD?.map((item) => item.remarks)?.join(' ') || ''
    const refNo = tranD?.map((item) => item.lineRefNo)?.join(' ') || ''
    const basic = (amount / (1 + gstRate / 100))
    const tableBody = [
        descr, refNo, formatNumber(basic), gstRate, hsn,
        formatNumber(cgst), formatNumber(sgst), formatNumber(igst),
        formatNumber(amount || 0)
    ]

    autoTable(context.doc, {
        startY: tableStartY,
        head: [['Description', 'Ref No', 'Basic', 'Gst Rate', 'HSN', 'CGST', 'SGST', 'IGST', 'Amount']],
        body: [tableBody],
        styles: {
            fontSize: PDF_CONFIG.FONT_SIZES.small,
            cellPadding: PDF_CONFIG.TABLE.cellPadding,
            textColor: PDF_CONFIG.COLORS.black,
            overflow: 'linebreak',
            minCellHeight: PDF_CONFIG.TABLE.minCellHeight,
        },
        headStyles: {
            fillColor: PDF_CONFIG.COLORS.white,
            textColor: PDF_CONFIG.COLORS.black,
            lineWidth: PDF_CONFIG.TABLE.lineWidth,
            halign: 'center',
        },
        columnStyles: {
            2: { halign: 'right' }, // Basic
            3: { halign: 'right' }, // Gst rate
            5: { halign: 'right' }, // Cgst
            6: { halign: 'right' }, // Sgst
            7: { halign: 'right' }, // Igst
            8: { halign: 'right' }, // Amount
        },
        margin: {
            left: PDF_CONFIG.PAGE.marginLeft,
            right: PDF_CONFIG.PAGE.marginLeft
        },
        theme: 'grid',
        pageBreak: 'avoid',
        tableWidth: 'auto',
        didDrawPage: (data) => {
            context.currentY = data.cursor?.y ?? 0;
        },
    });

    // Calculate final Y position after table
    let finalYAfterTable = context.doc.lastAutoTable?.finalY || tableStartY + 10;
    if (!finalYAfterTable || finalYAfterTable < tableStartY) {
        finalYAfterTable = tableStartY + (tableBody.length + 1) * 12;
    }
    context.currentY = finalYAfterTable + PDF_CONFIG.SPACING.buffer;
};

const drawSummaryBox = (
    context: PDFContext,
    cgst: number,
    sgst: number,
    igst: number,
    amount: number
): void => {
    addPageIfNeeded(context, PDF_CONFIG.SUMMARY.height);

    const summaryX = PDF_CONFIG.PAGE.marginLeft;
    let summaryY = context.currentY + PDF_CONFIG.SPACING.buffer;
    const lineStartX = summaryX;
    const lineEndX = context.pageWidth - PDF_CONFIG.PAGE.marginLeft;

    // Draw top line
    context.doc.setLineWidth(PDF_CONFIG.TABLE.lineWidth);
    context.doc.line(lineStartX, summaryY, lineEndX, summaryY);
    summaryY += PDF_CONFIG.SPACING.minimal;

    // Tax details
    const taxItems = [
        { label: 'CGST:', value: cgst },
        { label: 'SGST:', value: sgst },
        { label: 'IGST:', value: igst },
    ];

    let textX = summaryX;
    taxItems.forEach(item => {
        setFont(context.doc, 'bold');
        context.doc.text(item.label, textX, summaryY + PDF_CONFIG.SUMMARY.boxHeight / 2);
        setFont(context.doc, 'normal');
        context.doc.text(formatNumber(item.value), textX + PDF_CONFIG.SUMMARY.labelOffset, summaryY + PDF_CONFIG.SUMMARY.boxHeight / 2);
        textX += PDF_CONFIG.SUMMARY.labelSpacing;
    });

    // Total amount
    setFont(context.doc, 'bold');
    context.doc.text('Amount:', lineEndX - 120, summaryY + PDF_CONFIG.SUMMARY.boxHeight / 2);
    setFont(context.doc, 'normal');
    context.doc.text(formatNumber(amount), lineEndX, summaryY + PDF_CONFIG.SUMMARY.boxHeight / 2, { align: 'right' });

    // Draw bottom line
    context.doc.line(lineStartX, summaryY + PDF_CONFIG.SUMMARY.boxHeight * 0.8, lineEndX, summaryY + PDF_CONFIG.SUMMARY.boxHeight * 0.8);

    context.currentY = summaryY + PDF_CONFIG.SUMMARY.boxHeight;
};

const drawAmountInWords = (context: PDFContext, amount: number): void => {
    const amountWords = Utils.toWordsFromAmount(amount);
    setFont(context.doc, 'italic');
    context.currentY += PDF_CONFIG.SPACING.buffer;

    const wordsWrapped = context.doc.splitTextToSize(
        `Amount in Words: ${amountWords}`,
        context.pageWidth - 2 * PDF_CONFIG.PAGE.marginLeft
    );
    context.doc.text(wordsWrapped, PDF_CONFIG.PAGE.marginLeft, context.currentY);
    context.currentY += wordsWrapped.length * PDF_CONFIG.SPACING.line;
};

const drawSignature = (context: PDFContext): void => {
    const signatureHeight = 40;
    addPageIfNeeded(context, signatureHeight);
    context.currentY += PDF_CONFIG.SPACING.section;

    setFont(context.doc, 'normal');
    context.doc.text('Authorized Signatory', context.rightAlignX, context.currentY + PDF_CONFIG.SPACING.buffer, { align: 'right' });
};

const addPageNumbers = (context: PDFContext): void => {
    const pageCount = context.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        context.doc.setPage(i);
        setFont(context.doc, 'normal', PDF_CONFIG.FONT_SIZES.footer);
        context.doc.text(`Page ${i} of ${pageCount}`, context.rightAlignX, 20, { align: 'right' });
    }
};

const outputPDF = (doc: jsPDF): void => {
    try {
        const blob = doc.output('blob');
        const blobURL = URL.createObjectURL(blob);

        // Try to open in new window/tab
        const newWindow = window.open(blobURL, '_blank');

        if (!newWindow) {
            // Fallback for blocked popups - create download link
            const link = document.createElement('a');
            link.href = blobURL;
            link.download = `note_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Clean up blob URL after delay
        setTimeout(() => {
            URL.revokeObjectURL(blobURL);
        }, 1000);

    } catch (error) {
        console.error('Error outputting PDF:', error);
        throw new Error('Failed to generate PDF output');
    }
};

// Main export function
export function generateDebitCreditNotePDF({
    noteData,
    branchName,
    currentDateFormat,
    tranTypeId,
}: GenerateNotePDFProps): void {
    try {
        const title = TRAN_TYPE_LABELS[tranTypeId as keyof typeof TRAN_TYPE_LABELS] || TRAN_TYPE_LABELS.default;
        const context = initializePDFContext();

        // Extract data
        const { tranH, tranD, extGstTranD, businessContacts } = noteData;
        const companyInfo: UnitInfoType = Utils.getUnitInfo() || {};
        const amount = tranD?.[0]?.amount ?? 0;
        const cgst = extGstTranD?.cgst ?? 0;
        const sgst = extGstTranD?.sgst ?? 0;
        const igst = extGstTranD?.igst ?? 0;

        // Generate PDF content step by step
        drawTitle(context, title);

        // Draw company and party details side by side
        const leftY = drawCompanyDetails(context, companyInfo, branchName);
        context.currentY = PDF_CONFIG.PAGE.marginLeft + 32; // Reset to details top for party details (40 + 32 = 72)
        const rightY = drawPartyDetails(context, businessContacts);

        // Continue from the lower of the two sections
        context.currentY = Math.max(leftY, rightY) + PDF_CONFIG.SPACING.line / 2;

        drawNoteInfo(context, tranH, currentDateFormat, title);
        drawTable(context, noteData);
        drawSummaryBox(context, cgst, sgst, igst, amount);
        drawAmountInWords(context, amount);
        drawSignature(context);
        addPageNumbers(context);

        // Output the PDF
        outputPDF(context.doc);

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}