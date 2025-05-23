import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { Utils } from "../../../../utils/utils"
import { SuperAdminNewEditSecuredControl } from "./super-admin-new-edit-secured-control"
import jsonData from './secured-controls.json'
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { useContext } from "react";

export function SuperAdminNewSecuredControlButtons({ dataInstance }: { dataInstance: string }) {
    const context: GlobalContextType = useContext(GlobalContext);
    return (
        <div className="flex gap-2">
            <button className="h-10 w-20 min-w-24 rounded-md bg-primary-400 text-white hover:bg-primary-600" onClick={handleImport}>import</button>
            <button className="h-10 w-20 min-w-24 rounded-md bg-primary-400 text-white hover:bg-primary-600" onClick={handleNewSecuredControl}>New</button>
        </div>)

    async function handleImport() {
        //Sends secured-controls.json file to server for import into database
        try {
            const q: any = GraphQLQueriesMap.importSecuredControls(GLOBAL_SECURITY_DATABASE_NAME, jsonData);
            const queryName: string = GraphQLQueriesMap.importSecuredControls.name;
            await Utils.mutateGraphQL(q, queryName);
            context.CompSyncFusionGrid[dataInstance].loadData()
        } catch (e: any) {
            console.log(e)
        }
    }

    function handleNewSecuredControl() {
        Utils.showHideModalDialogA({
            title: "New secured control",
            isOpen: true,
            element: <SuperAdminNewEditSecuredControl dataInstance={dataInstance} />,
        })
    }
}