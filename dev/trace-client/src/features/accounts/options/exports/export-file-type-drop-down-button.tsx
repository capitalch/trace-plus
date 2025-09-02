import clsx from "clsx";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";
import { useExport } from "./export-hook";
import { ExportFileType, ExportNameType } from "./all-exports";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";

export function ExportFileTypeDropDownButton({ className }: { className?: string }) {
    const selectedExportName: ExportNameType = useSelector((state: RootStateType) => state.accounts.exports.exportName as ExportNameType)
    const selectedDateRange = useSelector((state: RootStateType) => state.reduxComp.compDateRange[CompInstances.compDateRangeExports])
    const { exportFile } = useExport()

    const [selectedFileType, setSelectedFileType] = useState(fileTypes[0]);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={clsx(className, "relative inline-block text-left")}>
            <div className="flex items-center w-56 border border-gray-300 rounded-lg shadow-md overflow-hidden">
                <button
                    className="px-2 py-2 w-full font-medium text-white rounded-l-lg transition hover:bg-primary-600 bg-primary-500"
                    onClick={() => doExport(selectedFileType)}>
                    Export as {selectedFileType}
                </button>
                <button
                    className="px-3 py-2 text-white border-l border-white/20 rounded-r-lg transition hover:bg-primary-700 bg-primary-600"
                    onClick={() => setIsOpen(!isOpen)}>▼
                </button>
            </div>
            {isOpen && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                    {fileTypes.map((type) => (
                        <button
                            key={type}
                            className="px-4 py-3 w-full text-left transition duration-200 hover:bg-blue-100"
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