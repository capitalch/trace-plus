# Plan: Display PDF in Modal Instead of New Browser Tab

## Current Behavior
The `generateSalesInvoicePDF` function currently:
- Generates a PDF using jsPDF library (line 550-552 in all-sales-invoice-jspdf.tsx)
- Creates a blob URL from the PDF
- Opens the PDF in a new browser tab using `window.open(blobURL)`

## Proposed Changes

### 1. Create a PDF Viewer Modal Component
**File:** `src/features/accounts/purchase-sales/sales/pdf-viewer-modal.tsx` (new file)
- Create a new modal component using the existing `CustomModalDialog` pattern
- Use an `<iframe>` or `<object>` element to embed the PDF blob URL
- Include controls for:
  - Close button (already provided by CustomModalDialog)
  - Optional: Download button
  - Optional: Print button
- Modal should be full-screen or near full-screen (90vh) for better PDF viewing

### 2. Modify PDF Generation Function
**File:** `src/features/accounts/purchase-sales/sales/all-sales-invoice-jspdf.tsx`
- Change the function signature to return the blob URL instead of opening it
- Remove `window.open(blobURL)` call (line 552)
- Return the `blobURL` to the caller
- Alternative: Accept a callback function to handle the PDF blob

### 3. Update Calling Components
**Files to modify:**
- `src/features/accounts/purchase-sales/sales/sales-view/all-sales-view.tsx` (line 376)
- `src/features/accounts/purchase-sales/sales/status-bar/status-bar.tsx` (line 94)

**Changes needed:**
- Add state to manage modal open/close
- Add state to store the PDF blob URL
- When PDF button is clicked, call `generateSalesInvoicePDF` and store the returned blob URL
- Open the PDF viewer modal with the blob URL
- Properly clean up blob URLs when modal closes using `URL.revokeObjectURL()`

## Implementation Steps

1. **Step 1:** Create the PDFViewerModal component
   - Use CustomModalDialog as base
   - Add iframe/object for PDF display
   - Add download and print functionality
   - Ensure proper blob URL cleanup on unmount

2. **Step 2:** Modify generateSalesInvoicePDF function
   - Change return type from `void` to `string` (returns blob URL)
   - Remove `window.open(blobURL)` call
   - Return `blobURL`

3. **Step 3:** Update all-sales-view.tsx
   - Import PDFViewerModal
   - Add state: `const [pdfModalOpen, setPdfModalOpen] = useState(false)`
   - Add state: `const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)`
   - Modify PDF button handler to get blob URL and open modal
   - Add cleanup effect for blob URL
   - Render PDFViewerModal component

4. **Step 4:** Update status-bar.tsx
   - Same changes as all-sales-view.tsx

## Benefits
- Better user experience (no popup blockers)
- Stays within the application context
- Easier to add additional functionality (download, print buttons)
- Consistent with modal pattern used throughout the app
- Automatic blob URL cleanup

## Technical Notes
- Use `<iframe>` with `src={blobURL}` for PDF display
- Set iframe to full height of modal body
- Add proper cleanup with `URL.revokeObjectURL()` when modal closes
- Consider adding loading state while PDF generates
