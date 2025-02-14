import clsx from "clsx";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store/store";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";
import { useExport } from "./export-hook";
import { ExportFileType, ExportNameType } from "./all-exports";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";
// import { selectCompSwitchStateFn } from "../../../../controls/redux-components/comp-slice";

export function ExportFileTypeDropDownButton({ className }: { className?: string }) {
    const selectedExportName: ExportNameType = useSelector((state: RootStateType) => state.accounts.exports.exportName as ExportNameType)
    const selectedDateRange = useSelector((state: RootStateType) => state.reduxComp.compDateRange[CompInstances.compDateRangeExports])
    // const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchExports)) || false
    const { exportFile } = useExport()

    const [selectedFileType, setSelectedFileType] = useState(fileTypes[0]);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={clsx(className, "relative inline-block text-left")}>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-md w-56">
                <button
                    className="bg-primary-500 text-white px-2 py-2 font-medium rounded-l-lg hover:bg-primary-600 transition w-full"
                    onClick={() => doExport(selectedFileType)}>
                    Export as {selectedFileType}
                </button>
                <button
                    className="bg-primary-600 text-white px-3 py-2 rounded-r-lg border-l border-white/20 hover:bg-primary-700 transition"
                    onClick={() => setIsOpen(!isOpen)}>▼
                </button>
            </div>
            {isOpen && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                    {fileTypes.map((type) => (
                        <button
                            key={type}
                            className="w-full px-4 py-3 text-left hover:bg-blue-100 transition duration-200"
                            onClick={() => handleSelection(type)}>
                            {type}
                        </button>
                    ))}
                </div>
            )}
        </div>);

    async function doExport(type: string) {
        if (!selectedExportName) {
            Utils.showAlertMessage('Warning', Messages.errSelectExportType)
            return
        }
        await exportFile({
            exportName: selectedExportName as ExportNameType,
            fileType: getFileType(type),
            startDate: selectedDateRange.startDate,
            endDate: selectedDateRange.endDate
        })
    }

    function getFileType(type: string): ExportFileType {
        let fileType = type
        if (['gst', 'finalAccounts'].includes(selectedExportName)) {
            if (fileType === 'pdf') {
                fileType = 'pdfZip'
            }
            if (fileType === 'csv') {
                fileType = 'csvZip'
            }
        }
        return (fileType as ExportFileType)
    }

    function handleSelection(type: any) {
        setSelectedFileType(type);
        setIsOpen(false);
        doExport(type)
    }
}

const fileTypes = ["xlsx", "pdf", "csv", "json"];