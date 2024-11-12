import { useForm } from "react-hook-form";
import _ from 'lodash'
import { Messages } from "../../../../utils/messages";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { useContext } from "react";

export function AdminLinkUserWithBuModal({ buId, instance }: LinkUserWithBuModalType) {
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

    const registerUserId = register("userId", {
        required: Messages.errRequired,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-auto gap-2 min-w-80">

                {/* User id */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="mb-1 font-bold">Select user to link with <WidgetAstrix /></span>
                    <CompReactSelect
                        getOptions={getUserOptions}
                        optionLabelName="user"
                        optionValueName="id"
                        {...registerUserId}
                        onChange={handleOnChangeUser}
                        placeHolder="Select userName : email : uid"
                        ref={null} // necessary for react-hook-form
                        selectedValue={null}
                    />
                    {errors.userId && <WidgetFormErrorMessage errorMessage={errors.userId.message} />}
                </label>

                {/* Save */}
                <div className="flex justify-start mt-4">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors) || isSubmitting} />
                </div>
            </div>
        </form>
    )

    async function getUserOptions(setOptions: (args: any) => void) {
        const q = GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, {
            sqlId: SqlIdsMap.getUsersNotLinkedWithBuIdExcludeAdmin
            , sqlArgs: { buId:buId}
        });
        const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMap.genericQuery.name);
        setOptions(res.data.genericQuery);
    }

    function handleOnChangeUser(selectedObject: any) {
        setValue("userId", selectedObject?.id);
        clearErrors("userId");
    }

    async function onSubmit(data: FormDataType) {
        if (!_.isEmpty(errors)) {
            return;
        }

        const traceDataObject: TraceDataObjectType = {
            tableName: "UserBuX",
            xData: {
                ...data,
                buId: buId
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
    userId: string;
};

type LinkUserWithBuModalType = {
    buId: number
    instance: string
}