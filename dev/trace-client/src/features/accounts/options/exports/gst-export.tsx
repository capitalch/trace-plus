import axios from "axios"
import { Utils } from "../../../../utils/utils"
import urlJoin from "url-join"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { RequestDataType } from "./all-exports"
import { encodeObj } from "../../../../app/graphql/maps/graphql-queries-map"

export function GstExport() {
    const {
        branchId
        , buCode
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()
    return (<div>
        <button onClick={handleGstExport} className="bg-slate-100 px-2 py-1 rounded-md hover:bg-slate-200">Gst export</button>
    </div>)

    async function handleGstExport() {
        const token = Utils.getToken()
        const hostUrl = Utils.getHostUrl()
        try {
            const requestData: RequestDataType = {
                branchId: branchId || 1,
                buCode: buCode || '',
                clientId: Utils.getCurrentLoginInfo().userDetails?.clientId || 0,
                dateFormat: Utils.getCurrentDateFormat(),
                dbParams: decodedDbParamsObject || '',
                dbName: dbName || '',
                exportName: 'gst',
                fileType: 'xlsx',
                finYearId: finYearId || 0
            }
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
            link.setAttribute("download", "gstReportAll.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            // window.URL.revokeObjectURL(url)
        } catch (e: any) {
            Utils.showErrorMessage(e)
        }
    }
}