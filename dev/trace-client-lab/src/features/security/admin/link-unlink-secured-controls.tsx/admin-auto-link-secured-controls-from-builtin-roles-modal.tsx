import { useForm } from "react-hook-form";
import _ from 'lodash'
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { useContext } from "react";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { Messages } from "../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";

export function AdminAutoLinkSecuredControlsFromBuiltinRolesModal({ adminRoleId, instance }: AdminAutoLinkSecuredControlsFromBuiltinRolesModalype) {
    const context: GlobalContextType = useContext(GlobalContext);
    const {
        clearErrors,
        handleSubmit,
        register,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "all",
    });

    const registerSuperAdminRoleId = register("superAdminRoleId", {
        required: Messages.errRequired,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-auto gap-2 min-w-80">

                {/* Built-in roles*/}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="mb-1 font-bold">Built-in roles <WidgetAstrix /></span>
                    <CompReactSelect
                        getOptions={getBuiltinRolesOptions}
                        optionLabelName="roleName"
                        optionValueName="id"
                        {...registerSuperAdminRoleId}
                        onChange={handleOnChangeBuiltinRole}
                        placeHolder="Select a built-in role"
                        ref={null} // necessary for react-hook-form
                        selectedValue={null}
                    />
                    {errors.superAdminRoleId && <WidgetFormErrorMessage errorMessage={errors.superAdminRoleId.message} />}
                </label>
                <label className="text-md text-lime-600">On saving, the secured controls from selected built-in role will be auto added</label>

                {/* save */}
                <div className="flex justify-start mt-4">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors) || isSubmitting} />
                </div>
            </div>
        </form>
    )

    async function getBuiltinRolesOptions(setOptions: (args: any) => void) {
        const q = GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, {
            sqlId: SqlIdsMap.getBuiltinRoles
        });
        const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMapNames.genericQuery);
        setOptions(res.data.genericQuery);
    }

    function handleOnChangeBuiltinRole(selectedObject: any) {
        setValue("superAdminRoleId", selectedObject?.id);
        clearErrors("superAdminRoleId");
    }

    async function onSubmit(data: FormDataType) {
        if (!_.isEmpty(errors)) {
            return;
        }
        try { // Using a genericQuery, insert is done
            const res: any = await Utils.queryGraphQL(
                GraphQLQueriesMap.genericQuery(
                    GLOBAL_SECURITY_DATABASE_NAME,
                    {
                        sqlId: SqlIdsMap.insertSecuredControlsFromBuiltinRole,
                        sqlArgs: {
                            adminRoleId: adminRoleId
                            , superAdminRoleId: data.superAdminRoleId
                        }
                    }),
                GraphQLQueriesMapNames.genericQuery
            )
            if (res?.data.genericQuery) {
                Utils.showHideModalDialogA({ isOpen: false });
                context.CompSyncFusionTreeGrid[instance].loadData();
                Utils.showSaveMessage();
            }
        } catch (e: any) {
            console.log(e);
        }
    }
}

type FormDataType = {
    adminRoleId: string
    superAdminRoleId: string
};

type AdminAutoLinkSecuredControlsFromBuiltinRolesModalype = {
    adminRoleId: string
    instance: string
}