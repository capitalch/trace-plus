import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { useEffect } from "react";
import { useValidators } from "../../../../utils/validators-hook";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { AllTables} from "../../../../app/maps/database-tables-map";

export function AdminNewEditBusinessUser({
    roleId,
    userName,
    mobileNo,
    userEmail,
    descr,
    isActive,
    id,
    loadData
}: AdminNewEditBusinessUserType) {
    const { checkNoSpecialChar, checkEmail, checkMobileNo } = useValidators();
    const {
        clearErrors,
        getValues,
        handleSubmit,
        register,
        setError,
        setValue,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "all",
    });
    
    const registerRoleId = register("roleId", {
        required: Messages.errRequired,
    });

    const registerUserName = register("userName", {
        required: Messages.errRequired,
        validate: {
            validUserName: checkNoSpecialChar,
        },
    });

    const registerMobileNo = register("mobileNo", {
        required: Messages.errRequired,
        validate: {
            validMobileNo: checkMobileNo,
        },
    });

    const registerUserEmail = register("userEmail", {
        required: Messages.errRequired,
        validate: {
            validEmail: checkEmail,
        },
        onBlur: validateUserEmailAtServer,
    });

    const registerDescr = register("descr");

    const registerIsActive = register("isActive");

    useEffect(() => {
        setValue("roleId", roleId || "", { shouldDirty: true, shouldTouch: true });
        setValue("userName", userName || "");
        setValue("mobileNo", mobileNo || "");
        setValue("userEmail", userEmail || "");
        setValue("descr", descr || "");
        setValue("isActive", isActive || false);
        setValue("id", id);
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-auto min-w-72 gap-2">

                {/* Role id */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User role <WidgetAstrix /></span>
                    <CompReactSelect
                        getOptions={getRoleOptions}
                        optionLabelName="roleName"
                        optionValueName="id"
                        {...registerRoleId}
                        onChange={handleOnChangeRole}
                        ref={null} // necessary for react-hook-form
                        selectedValue={roleId}
                    />
                    {errors.roleId && <WidgetFormErrorMessage errorMessage={errors.roleId.message} />}
                </label>

                {/* User Name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User name <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. John Doe"
                        autoComplete="off"
                        className="mt-1 px-2 border border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerUserName}
                    />
                    {errors.userName && <WidgetFormErrorMessage errorMessage={errors.userName.message} />}
                </label>

                {/* Mobile Number */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User mobile number <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. +1234567890"
                        autoComplete="off"
                        className="mt-1 px-2 border border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerMobileNo}
                    />
                    {errors.mobileNo && <WidgetFormErrorMessage errorMessage={errors.mobileNo.message} />}
                </label>

                {/* Email */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User email <WidgetAstrix /></span>
                    <input
                        type="email"
                        placeholder="e.g. john@example.com"
                        autoComplete="off"
                        className="mt-1 px-2 border border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerUserEmail}
                    />
                    {errors.userEmail && <WidgetFormErrorMessage errorMessage={errors.userEmail.message} />}
                </label>

                {/* Remarks */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Description</span>
                    <input
                        type="text"
                        placeholder="e.g. Important user"
                        autoComplete="off"
                        className="mt-1 px-2 border border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerDescr}
                    />
                </label>

                {/* Active Status */}
                <label className="flex flex-row items-center font-medium text-primary-400">
                    <input type="checkbox" {...registerIsActive} className="mr-2 cursor-pointer" />
                    <span className="cursor-pointer">Is Active</span>
                </label>

                {/* Save */}
                <div className="flex justify-start mt-4">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors) || isSubmitting} />
                </div>
                <span>{showServerValidationError()}</span>
            </div>
        </form>
    );

    async function getRoleOptions(setOptions: (args: any) => void) {
        const q = GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, { sqlId: SqlIdsMap.getAllRoleNamesOnClientIdWithBuiltinRoles, sqlArgs: { clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId } });
        const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMapNames.genericQuery);
        setOptions(res.data.genericQuery);
    }

    function handleOnChangeRole(selectedObject: any) {
        setValue("roleId", selectedObject?.id);
        clearErrors("roleId");
        validateUserEmailAtServer({});
    }

    async function onSubmit(data: FormDataType) {
        if (!(await validateUserEmailAtServer({}))) {
            return;
        }
        if (!_.isEmpty(errors)) {
            return;
        }
        const traceDataObject: TraceDataObjectType = {
            tableName: AllTables.UserM.name,
            xData: {
                ...data,
                clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId
            },
        };
        try {
            const q: any = GraphQLQueriesMap.updateUser(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.updateUser;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({ isOpen: false });
            await loadData()
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e);
        }
    }

    function showServerValidationError() {
        let Ret = <></>;
        if (errors?.root?.userEmail) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.userEmail.message} />;
        } else {
            Ret = <WidgetFormHelperText helperText="&nbsp;" />;
        }
        return Ret;
    }

    async function validateUserEmailAtServer(e: any) {
        let ret: boolean = true;
        const values: any = getValues();
        const userEmail: string = e?.target?.value || values?.userEmail;
        if ((!userEmail) || (!values.roleId)) {
            return;
        }
        const isValid = await trigger('userEmail')
        if (!isValid) {
            return
        }
        try {
            const res: any = await Utils.queryGraphQL(
                GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, {
                    sqlId: SqlIdsMap.getUserIdOnClientIdEmail,
                    sqlArgs: {
                        id: id || null,
                        clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId,
                        userEmail: userEmail,
                    },
                }),
                GraphQLQueriesMapNames.genericQuery
            );

            if (!_.isEmpty(res?.data?.genericQuery[0])) {
                setError("root.userEmail", {
                    type: "serverError",
                    message: Messages.errEmailExistsForClient,
                });
                ret = false;
            } else {
                clearErrors("root.userEmail");
            }
            return ret;
        } catch (e: any) {
            console.log(e);
        }
    }
}

type FormDataType = {
    roleId: string;
    userName: string;
    mobileNo: string;
    userEmail: string;
    descr: string;
    isActive: boolean;
    id?: string;
};

type AdminNewEditBusinessUserType = {
    roleId?: string;
    userName?: string;
    mobileNo?: string;
    userEmail?: string;
    descr?: string;
    isActive?: boolean;
    id?: string;
    loadData: () => void
};
