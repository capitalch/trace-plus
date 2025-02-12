import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { GstExport } from "./gst-export/gst-export";

export function AllExports() {
    return (<CompAccountsContainer>
        <label className="mt-3 text-lg font-medium text-primary-500">All exports</label>
        <div className="flex flex-col">
            <div className="flex mt-4 justify-between mr-6 px-4 items-center">
                <GstExport />
                {/* <label className="text-orange-600 font-medium">{Messages.messTransferClosingBalance}</label> */}
                {/* <button onClick={handleTransferClosingBalance} className="px-5 py-2 font-medium text-white inline-flex items-center bg-red-500 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 disabled:bg-red-200">
                    <IconTransfer className="text-white w-6 h-6 mr-2" /> Transfer
                </button> */}
            </div>
        </div>
    </CompAccountsContainer>)
}

export type RequestDataType = {
    branchId: number
    buCode: string
    clientId: number
    dateFormat: string
    dbParams: string | { [key: string]: string | undefined }
    dbName: string
    endDate?: string
    exportName: ExportNameType
    fileType: ExportFileType
    finYearId: number
    startDate?: string
}

export type ExportNameType = 'accountsMaster' | 'contra' | 'finalAccounts' | 'gst' | 'journal' | 'payment' | 'receipt' | 'trialBalance' | 'voucher'
export type ExportFileType = 'csv' | 'csvZip' | 'json' | 'pdf' | 'pdfZip' | 'xlsx'

