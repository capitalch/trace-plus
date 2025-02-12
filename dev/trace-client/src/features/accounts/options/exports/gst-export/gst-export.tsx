import { CompDateRange } from "../../../../../controls/redux-components/comp-date-range/comp-date-range"
import { CompInstances } from "../../../../../controls/redux-components/comp-instances"
// import { useExport } from "../export-hook"
// import { GstExportDateSelector } from "./gst-export-date-selector"
// import { GstExportHeader } from "./gst-export-header"

export function GstExport() {
    // const { exportFile } = useExport()
    const dateRangeInstance: string = CompInstances.compDateRangeExports
    return (<div className="flex flex-col space-y-4">
        <CompDateRange instance={dateRangeInstance} />
        {/* <button onClick={handleGstExport} className="bg-slate-100 px-2 py-1 rounded-md hover:bg-slate-200">Gst export</button> */}
    </div>)

    // async function handleGstExport() {
    //     await exportFile({
    //         exportName: 'gst',
    //         fileType: 'pdfZip',
    //         startDate: '2024-04-01',
    //         endDate: '2025-03-31'
    //     })
    // }
}