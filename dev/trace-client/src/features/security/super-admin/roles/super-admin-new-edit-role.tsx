import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetTooltip } from "../../../../controls/widgets/widget-tooltip";
import { useContext, useEffect } from "react";
import { useValidators } from "../../../../utils/validators-hook";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
// import { GlobalContext } from "../../../../App";
import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";

export function SuperAdminNewEditRole({
    descr,
    roleName,
    dataInstance,
    id,
}: SuperAdminNewEditRoleType) {
    const { checkNoSpecialChar } = useValidators();
    const { clearErrors, handleSubmit, register, setError, setValue, trigger, formState: { errors }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });
    const context: GlobalContextType = useContext(GlobalContext);

    const registerRoleName = register("roleName", {
        required: Messages.errRequired,
        validate: {
            noSpecialChar: checkNoSpecialChar
        },
        onChange: (e: any) => {
            ibukiDdebounceEmit(IbukiMessages["DEBOUNCE-ROLE-NAME"], { roleName: e.target.value });
        }
    });

    const registerDescr = register("descr")

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-ROLE-NAME"], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('roleName')
            if (isValid) {
                validateRoleNameAtServer(d.data);
            }
        });
        setValue("roleName", roleName || "");
        setValue("id", id);
        setValue("descr", descr || undefined)

        return () => {
            subs1.unsubscribe();
        };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 w-auto min-w-72">

                {/* Role name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Role name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. Administrator" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerRoleName}
                    />
                    <span className="flex justify-between">
                        {(errors.roleName)
                            ? <WidgetFormErrorMessage errorMessage={errors.roleName.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <WidgetTooltip title={Messages.messRoleName} className="font-normal text-sm !-top-5 bg-white !text-blue-500 border-gray-200 border-2">
                            <span className="ml-auto text-xs text-primary-400 hover:cursor-pointer">?</span>
                        </WidgetTooltip>
                    </span>
                </label>

                {/* Description */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Role description</span>
                    <input type="text" placeholder="e.g. Has all powers to insert, modify and delete" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerDescr}
                    />
                </label>

                {/* Save */}
                <div className="mt-4 flex justify-start">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors)} />
                </div>
                <span>
                    {showServerValidationError()}
                </span>
            </div>
        </form>
    );

    async function onSubmit(data: FormDataType) {
        const traceDataObject: TraceDataObjectType = {
            tableName: "RoleM",
            xData: {
                ...data,
            }
        };
        try {
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMap.genericUpdate.name;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({
                isOpen: false,
            });
            context.CompSyncFusionGrid[dataInstance].loadData();
            Utils.showSaveMessage()
        } catch (e: any) {
            console.log(e.message);
        }
    }

    function showServerValidationError() {
        let Ret = <></>;
        if (errors?.root?.roleName) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.roleName.message} />;
        } else {
            Ret = <WidgetFormHelperText helperText="&nbsp;" />;
        }
        return Ret;
    }

    async function validateRoleNameAtServer(value: any) {
        const res: any = await Utils.queryGraphQL(
            GraphQLQueriesMap.genericQuery(
                GLOBAL_SECURITY_DATABASE_NAME,
                {
                    sqlId: SqlIdsMap.getSuperAdminRoleOnRoleName,
                    sqlArgs: { roleName: value?.roleName }
                }),
            GraphQLQueriesMap.genericQuery.name);
        if (res?.data?.genericQuery[0]) {
            setError("root.roleName", {
                type: "serverError",
                message: Messages.errSuperAdminRoleNameExists
            });
        } else {
            clearErrors("root.roleName");
        }
    }
}

type FormDataType = {
    descr: string | undefined
    roleName: string;
    id?: string;
};

type SuperAdminNewEditRoleType = {
    dataInstance: string;
    descr?: string | undefined
    roleName?: string;
    id?: string;
};
