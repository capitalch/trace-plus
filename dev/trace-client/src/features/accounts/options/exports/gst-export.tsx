import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { Utils } from "../../../../utils/utils"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"

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
        const queryName: string = GraphQLQueriesMap.downloadTestXlsx.name
        const q: any = GraphQLQueriesMap.downloadTestXlsx(
            dbName || '',
            {
                buCode: buCode,
                dbParams: decodedDbParamsObject,
                sqlArgs: {
                    branchId: branchId,
                    finYearId: finYearId
                },
            }
        )
        try {
            const res: any = await Utils.queryGraphQL(q, queryName)
            // const jsonResult: any = res?.data[queryName][0]?.jsonResult
            console.log(res)
        } catch (e: any) {
            console.log(e)
        }
    }
}