import { PDFViewer } from "@react-pdf/renderer";
import { useState } from "react";
import SlidingPane from 'react-sliding-pane';
import { GeneralLedgerPdf } from "./general-ledger-pdf";

export function SlidingPaneViewer() {

    const [isPaneOpen, setIsPaneOpen] = useState(false);
    return (
        <div>
            {/* Button to open the sliding pane */}
            <button onClick={() => setIsPaneOpen(true)}>View General Ledger Report</button>

            {/* Sliding Pane */}
            <SlidingPane
                isOpen={isPaneOpen}
                title="General Ledger Report"
                from="right" // Slide in from the right
                width="95%" // Adjust width as needed
                onRequestClose={() => setIsPaneOpen(false)} // Close the pane
            >
                {/* PDF Viewer inside the sliding pane */}
                <PDFViewer style={{ width: '100%', height: '90vh' }}>
                    <GeneralLedgerPdf />
                </PDFViewer>
            </SlidingPane>
        </div>
    );
}