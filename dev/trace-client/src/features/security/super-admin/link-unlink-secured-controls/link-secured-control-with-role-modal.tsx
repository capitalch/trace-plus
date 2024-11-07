import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { GlobalContext } from "../../../../App";
import { useForm } from "react-hook-form";
import { Messages } from "../../../../utils/messages";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import _ from 'lodash'

export function LinkSecuredControlWithRoleModal({ roleId, instance }: LinkSecuredControlWithRoleModalType) {
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

    const registerSecuredControlId = register("securedControlId", {
        required: Messages.errRequired,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-auto gap-2 min-w-80">

                {/* Secured control id */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="mb-1 font-bold">Select secured control to link with <WidgetAstrix /></span>
                    <CompReactSelect
                        getOptions={getSecuredControlOptions}
                        optionLabelName="controlName"
                        optionValueName="id"
                        {...registerSecuredControlId}
                        onChange={handleOnChangeSecuredControl}
                        placeHolder="Select secured control"
                        ref={null} // necessary for react-hook-form
                        selectedValue={null}
                    />
                    {errors.securedControlId && <WidgetFormErrorMessage errorMessage={errors.securedControlId.message} />}
                </label>

                {/* Save */}
                <div className="flex justify-start mt-4">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors) || isSubmitting} />
                </div>
            </div>
        </form>
    )

    async function getSecuredControlOptions(setOptions: (args: any) => void) {
        const q = GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, {
            sqlId: SqlIdsMap.getSecuredControlsNotLinkedWithRoleId
            , sqlArgs: { roleId: roleId }
        });
        const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMap.genericQuery.name);
        setOptions(res.data.genericQuery);
    }

    function handleOnChangeSecuredControl(selectedObject: any) {
        setValue("securedControlId", selectedObject?.id);
        clearErrors("securedControlId");
    }

    async function onSubmit(data: FormDataType) {
        if (!_.isEmpty(errors)) {
            return;
        }

        const traceDataObject: TraceDataObjectType = {
            tableName: "RoleSecuredControlX",
            xData: {
                ...data,
                roleId: roleId
            },
        };

        try {
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMap.genericUpdate.name;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({ isOpen: false });
            context.CompSyncFusionTreeGrid[instance].loadData();
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e.message);
        }
    }
}

type FormDataType = {
    securedControlId: string;
};

type LinkSecuredControlWithRoleModalType = {
    roleId: string
    instance: string
}