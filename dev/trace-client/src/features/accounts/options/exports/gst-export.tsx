import axios from "axios"
// import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { Utils } from "../../../../utils/utils"
// import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import urlJoin from "url-join"

export function GstExport() {
    // const {
    //     branchId
    //     , buCode
    //     , dbName
    //     , decodedDbParamsObject
    //     , finYearId
    // } = useUtilsInfo()
    return (<div>
        <button onClick={handleGstExport} className="bg-slate-100 px-2 py-1 rounded-md hover:bg-slate-200">Gst export</button>
    </div>)

    async function handleGstExport() {
        const token = Utils.getToken()
        const hostUrl = Utils.getHostUrl()
        try {
            const response = await axios.get(urlJoin(hostUrl, 'download-excel'), {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob", // Important for handling binary data
            });
            // Create a Blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "report.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e: any) {
            console.log(e)
        }
    }

    // async function handleGstExport1() {
    //     const queryName: string = GraphQLQueriesMap.downloadTestXlsx.name
    //     const q: any = GraphQLQueriesMap.downloadTestXlsx(
    //         dbName || '',
    //         {
    //             buCode: buCode,
    //             dbParams: decodedDbParamsObject,
    //             sqlArgs: {
    //                 branchId: branchId,
    //                 finYearId: finYearId
    //             },
    //         }
    //     )
    //     try {
    //         const res: any = await Utils.queryGraphQL(q, queryName)
    //         // const jsonResult: any = res?.data[queryName][0]?.jsonResult
    //         console.log(res)
    //     } catch (e: any) {
    //         console.log(e)
    //     }
    // }
}