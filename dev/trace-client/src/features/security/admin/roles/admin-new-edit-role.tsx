import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { useContext, useEffect } from "react";
import { useValidators } from "../../../../utils/validators-hook";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function AdminNewEditRole({
    descr,
    roleName,
    inheritedFrom,
    dataInstance,
    id,
}: AdminNewEditRoleType) {
    const { checkNoSpecialChar } = useValidators();
    const { clearErrors, handleSubmit, register, setError, setValue, trigger, formState: { errors, isDirty, isValid }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });
    const context: GlobalContextType = useContext(GlobalContext);
    // const {buCode, decodedDbParamsObject} = useUtilsInfo();

    const registerRoleName = register("roleName", {
        required: Messages.errRequired,
        validate: {
            noSpecialChar: checkNoSpecialChar
        },
        onChange: (e: any) => {
            ibukiDdebounceEmit(IbukiMessages["DEBOUNCE-ROLE-NAME"], { roleName: e.target.value });
        }
    });

    const registerDescr = register("descr");

    const registerInheritedFrom = register("inheritedFrom", {
        required: Messages.errRequired,
    });

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-ROLE-NAME"], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('roleName');
            if (isValid) {
                validateRoleNameAtServer(d.data);
            }
        });
        setValue("roleName", roleName || "");
        setValue("id", id);
        setValue("descr", descr || undefined);
        setValue("inheritedFrom", inheritedFrom || "");
        return () => {
            subs1.unsubscribe();
        };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-auto min-w-72 gap-2">

                {/* Role name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Role name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. Administrator" autoComplete="off"
                        className="mt-1 px-2 border border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerRoleName}
                    />
                    <span className="flex justify-between">
                        {(errors.roleName)
                            ? <WidgetFormErrorMessage errorMessage={errors.roleName.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <TooltipComponent content={Messages.messRoleName} className="font-normal text-blue-500! text-sm bg-white border-2 border-gray-200 -top-5!">
                            <span className="ml-auto text-primary-400 text-xs hover:cursor-pointer">?</span>
                        </TooltipComponent>
                    </span>
                </label>

                {/* Inherited From */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold mb-1">Inherited from <WidgetAstrix /></span>
                    <CompReactSelect
                        getOptions={getBuiltinRoleOptions}
                        optionLabelName="roleName"
                        optionValueName="id"
                        {...registerInheritedFrom}
                        onChange={handleOnChangeInheritedFrom}
                        ref={null}
                        selectedValue={inheritedFrom}
                    />
                    {errors.inheritedFrom && <WidgetFormErrorMessage errorMessage={errors.inheritedFrom.message} />}
                </label>

                {/* Description */}
                <label className="flex flex-col font-medium text-primary-400 mt-4">
                    <span className="font-bold">Role description</span>
                    <input type="text" placeholder="e.g. Has all powers to insert, modify and delete" autoComplete="off"
                        className="mt-1 px-2 border border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerDescr}
                    />
                </label>

                {/* Save */}
                <div className="flex justify-start mt-4">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors) || !isDirty || (!isValid)} />
                </div>
                <span>
                    {showServerValidationError()}
                </span>
            </div>
        </form>
    );

    async function onSubmit(data: FormDataType) {
        const traceDataObject: TraceDataObjectType = {
            tableName: AllTables.RoleM.name,
            xData: {
                ...data,
                parentId: data.inheritedFrom || null,
                clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId || 0
            },
        };
        try {
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.genericUpdate;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({
                isOpen: false,
            });
            context.CompSyncFusionGrid[dataInstance].loadData();
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e);
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
                    sqlId: SqlIdsMap.getAdminRoleOnRoleNameClientId,
                    sqlArgs: { roleName: value?.roleName, clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId }
                }),
            GraphQLQueriesMapNames.genericQuery);
        if (res?.data?.genericQuery[0]) {
            setError("root.roleName", {
                type: "serverError",
                message: Messages.errAdminRoleNameExists // Updated message for Admin
            });
        } else {
            clearErrors("root.roleName");
        }
    }

    async function getBuiltinRoleOptions(setOptions: (args: any) => void) {
        const q = GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, { sqlId: SqlIdsMap.getBuiltinRoles });
        const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMapNames.genericQuery);
        setOptions(res.data.genericQuery);
    }

    function handleOnChangeInheritedFrom(selectedObject: any) {
        setValue("inheritedFrom", selectedObject?.id);
        clearErrors("inheritedFrom");
    }
}

type FormDataType = {
    descr: string | undefined;
    roleName: string;
    inheritedFrom: string;
    id?: string;
};

type AdminNewEditRoleType = {
    dataInstance: string;
    descr?: string | undefined;
    roleName?: string;
    inheritedFrom?: string;
    id?: string;
};

