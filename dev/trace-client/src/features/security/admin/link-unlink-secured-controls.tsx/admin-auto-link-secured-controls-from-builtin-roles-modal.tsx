import { useForm } from "react-hook-form";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { useContext } from "react";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";

export function AdminAutoLinkSecuredControlsFromBuiltinRolesModal({ roleId, instance }: AdminAutoLinkSecuredControlsFromBuiltinRolesModalype) {
    const context: GlobalContextType = useContext(GlobalContext);
    console.log(roleId, instance)
    return (<div className="flex flex-col w-auto gap-2 min-w-80">

        {/* Built-in roles*/}
        <label className="flex flex-col font-medium text-primary-400">
            <span className="mb-1 font-bold">Select secured control to link with <WidgetAstrix /></span>
            <CompReactSelect
                getOptions={getBuiltinRolesOptions}
                optionLabelName="roleName"
                optionValueName="id"
                // {...registerSecuredControlId}
                onChange={handleOnChangeBuiltinRole}
                placeHolder="Select secured control"
                ref={null} // necessary for react-hook-form
                selectedValue={null}
            />
        </label>
    </div>)

    async function getBuiltinRolesOptions(setOptions: (args: any) => void) {
        const q = GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, {
            sqlId: SqlIdsMap.getBuiltinRoles
            // , sqlArgs: { roleId: roleId }
        });
        const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMap.genericQuery.name);
        setOptions(res.data.genericQuery);
    }

    function handleOnChangeBuiltinRole() {

    }
}

type AdminAutoLinkSecuredControlsFromBuiltinRolesModalype = {
    roleId: string
    instance: string
}