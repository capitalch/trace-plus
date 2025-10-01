import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import { setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import { CompDateRange } from "../../../../controls/redux-components/comp-date-range";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";
import { CompSwitch } from "../../../../controls/redux-components/comp-switch";
import { ExportFileTypeDropDownButton } from "./export-file-type-drop-down-button";
import { ExportNamePicker } from "./export-name-picker";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { useEffect, useState } from "react";

export function AllExports() {
    const dispatch: AppDispatchType = useDispatch()
    const selectedExportName: ExportNameType = useSelector((state: RootStateType) => state.accounts.exports.exportName as ExportNameType, shallowEqual)
    const dateRangeInstance: string = CompInstances.compDateRangeExports
    const [isDateRangeDisabled, setDateRangeDisabled] = useState<boolean>(true)

    useEffect(() => {
        if ((selectedExportName === 'accountsMaster') || (selectedExportName === 'finalAccounts') || (selectedExportName === 'trialBalance')) {
            setDateRangeDisabled(true)
        } else {
            setDateRangeDisabled(false)
        }
    }, [selectedExportName])

    // Set main title for Exports
    useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Exports" }));
    }, [dispatch]);

    return (<CompAccountsContainer MiddleCustomControl={() => <CompSwitch instance={CompInstances.compSwitchExports} leftLabel="All branches" />}>
        <div className="flex flex-col mt-8 space-y-8">
            <div className="flex justify-between mr-6">
                <ExportNamePicker />
                <ExportFileTypeDropDownButton className="mt-6" />
            </div>
            <div className={`${isDateRangeDisabled ? "opacity-30 pointer-events-none" : ""}`}>
                <CompDateRange instance={dateRangeInstance} />
            </div>
        </div>
    </CompAccountsContainer>)
}

export type RequestDataType = {
    branchId: number | null
    buCode: string
    clientId: number
    currentDateFormat?: string
    dateFormat: string
    dbParams: string | { [key: string]: string | undefined }
    dbName: string
    endDate?: string
    exportName: ExportNameType
    fileType: ExportFileType
    finYearId: number
    startDate?: string
    tranTypeId: number
}

export type ExportNameType = 'accountsMaster' | 'contra' | 'finalAccounts' | 'gst' | 'journal' | 'payment' | 'receipt' | 'trialBalance' | 'voucher'
export type ExportFileType = 'csv' | 'csvZip' | 'json' | 'pdf' | 'pdfZip' | 'xlsx'