import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompDateRange } from "../../../../controls/redux-components/comp-date-range";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";
import { CompSwitch } from "../../../../controls/redux-components/comp-switch";
import { ExportFileTypeDropDownButton } from "./export-file-type-drop-down-button";
import { ExportNamePicker } from "./export-name-picker";

export function AllExports() {
    const dateRangeInstance: string = CompInstances.compDateRangeExports
    return (<CompAccountsContainer MiddleCustomControl={()=><CompSwitch instance={CompInstances.compSwitchExports} leftLabel="All branches" />}>
        <div className="flex flex-col mt-8 space-y-8">
            <div className="flex justify-between mr-6">
                <ExportNamePicker />
                <ExportFileTypeDropDownButton className="mt-6" />
            </div>

            <CompDateRange instance={dateRangeInstance} />
        </div>
    </CompAccountsContainer>)
}

export type RequestDataType = {
    branchId: number | null
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