import axios from "axios";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { ExportFileType, ExportNameType, RequestDataType } from "./all-exports";
import urlJoin from "url-join";
import { encodeObj } from "../../../../app/maps/graphql-queries-map";
import dayjs from "dayjs";
import { Messages } from "../../../../utils/messages";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { selectCompSwitchStateFn, showCompAppLoader } from "../../../../controls/redux-components/comp-slice";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";

export function useExport() {
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchExports)) || false
    const dispatch: AppDispatchType = useDispatch()

    const {
        branchId
        , branchCode
        , buCode
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    const fileExtension = {
        csv: 'csv',
        csvZip: 'zip',
        json: 'json',
        pdf: 'pdf',
        pdfZip: 'zip',
        xlsx: 'xlsx',
    }

    async function exportFile({ exportName, fileType, startDate, endDate }: ExportFileArgsType) {
        const token = Utils.getToken()
        const hostUrl = Utils.getHostUrl()
        const dateRange: string = startDate ? `${startDate}-to-${endDate}` : ''
        const currentDateTime = dayjs().format('YYYY-MM-DD-HHmmssSSS')
        startDate = startDate || '1900-01-01'
        endDate = endDate || '3000-12-31'
        try {
            const requestData: RequestDataType = {
                branchId: isAllBranches ? null : branchId || 1,
                buCode: buCode || '',
                clientId: Utils.getCurrentLoginInfo().userDetails?.clientId || 0,
                dateFormat: Utils.getCurrentDateFormat(),
                dbParams: decodedDbParamsObject || '',
                dbName: dbName || '',
                exportName: exportName,
                fileType: fileType,
                finYearId: finYearId || 0,
                startDate: startDate,
                endDate: endDate,
                tranTypeId: 0 // As a placeholder now. Populated at server
            }
            const ExportFileName: string = `${exportName}-${dateRange}-${buCode}-${isAllBranches ? 'AllBranches' : branchCode || ''}-${finYearId}-time-${currentDateTime}.${fileExtension[fileType]}`
            dispatch(showCompAppLoader({
                instance: CompInstances.compAppLoader,
                isVisible: true
            }))
            const response = await axios({
                method: 'post',
                url: urlJoin(hostUrl, 'api/export-file'),
                data: { valueString: encodeObj(requestData) },
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", ExportFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            exportErrorHandler(error) // ai
        }
        finally {
            dispatch(showCompAppLoader({
                instance: CompInstances.compAppLoader,
                isVisible: false
            }))
        }
    }

    function exportErrorHandler(error: any) {
        if (error.response && error.response.data) {
            // Convert blob error response to JSON
            const reader: any = new FileReader();
            reader.onload = function () {
                try {
                    const errorJson = JSON.parse(reader.result);
                    Utils.showErrorMessage(errorJson)
                } catch (parseError) {
                    Utils.showErrorMessage(parseError)
                }
            };
            reader.readAsText(error.response.data);
        } else {
            Utils.showErrorMessage(Messages.errUnknown)
        }
    }

    return ({ exportFile })

}

type ExportFileArgsType = {
    exportName: ExportNameType
    fileType: ExportFileType
    startDate?: string
    endDate?: string
}