import axios from "axios";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { ExportFileType, ExportNameType, RequestDataType } from "./all-exports";
import urlJoin from "url-join";
import { encodeObj } from "../../../../app/graphql/maps/graphql-queries-map";
import dayjs from "dayjs";

export function useExport() {
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
                branchId: branchId || 1,
                buCode: buCode || '',
                clientId: Utils.getCurrentLoginInfo().userDetails?.clientId || 0,
                dateFormat: Utils.getCurrentDateFormat(),
                dbParams: decodedDbParamsObject || '',
                dbName: dbName || '',
                exportName: exportName,
                fileType: fileType,
                finYearId: finYearId || 0,
                startDate: startDate,
                endDate: endDate
            }
            const ExportFileName: string = `${exportName}-${dateRange}-${buCode}-${branchCode || ''}-${finYearId}-time-${currentDateTime}.${fileExtension[fileType]}`
            const response = await axios({
                method: 'post',
                url: urlJoin(hostUrl, 'export-file'),
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
        } catch (e: any) {
            Utils.showErrorMessage(e)
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