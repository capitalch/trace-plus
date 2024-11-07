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
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
// import { GlobalContext } from "../../../../App";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";

export function SuperAdminNewEditAdminUser({
    clientId,
    userName,
    mobileNo,
    userEmail,
    descr,
    isActive,
    dataInstance,
    id,
}: SuperAdminNewEditAdminUserType) {
    const { checkNoSpecialChar, checkEmail, checkMobileNo } = useValidators();
    const { clearErrors, getValues, handleSubmit, register, setError, setValue, trigger, formState: { errors, isSubmitting }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "all",
    });
    const context: GlobalContextType = useContext(GlobalContext);

    const registerClientId = register("clientId", {
        required: Messages.errRequired,
    });

    const registerUserName = register("userName", {
        required: Messages.errRequired,
        validate: {
            validUserName: checkNoSpecialChar
        }
    });

    const registerMobileNo = register("mobileNo", {
        required: Messages.errRequired,
        validate: {
            validMobileNo: checkMobileNo
        }
    });

    const registerUserEmail = register("userEmail", {
        required: Messages.errRequired,
        validate: {
            validEmail: checkEmail
        },
        onBlur: validateUserEmailAtServer,
    });

    const registerDescr = register("descr");

    const registerIsActive = register("isActive");

    useEffect(() => {
        setValue("clientId", clientId || "", { shouldDirty: true, shouldTouch: true });
        setValue("userName", userName || "");
        setValue("mobileNo", mobileNo || "");
        setValue("userEmail", userEmail || "");
        setValue("descr", descr || "");
        setValue("isActive", isActive || false);
        setValue("id", id);
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 w-auto min-w-72">

                {/* Client id */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Client Name <WidgetAstrix /></span>
                    <CompReactSelect
                        getOptions={getClientOptions}
                        optionLabelName='clientName'
                        optionValueName='id'
                        {...registerClientId}
                        onChange={handleOnChangeClient}
                        ref={null} // necessary for react-hook-form
                        selectedValue={clientId}
                    />
                    {errors.clientId && <WidgetFormErrorMessage errorMessage={errors.clientId.message} />}
                </label>

                {/* User Name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. John Doe" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerUserName}
                    />
                    {errors.userName && <WidgetFormErrorMessage errorMessage={errors.userName.message} />}
                </label>

                {/* Mobile Number */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User mobile Number <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. +1234567890" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerMobileNo}
                    />
                    {errors.mobileNo && <WidgetFormErrorMessage errorMessage={errors.mobileNo.message} />}
                </label>

                {/* Email */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User email <WidgetAstrix /></span>
                    <input type="email" placeholder="e.g. john@example.com" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerUserEmail}
                    />
                    {errors.userEmail && <WidgetFormErrorMessage errorMessage={errors.userEmail.message} />}
                </label>

                {/* Remarks */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Description</span>
                    <input type="text" placeholder="e.g. Important user" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerDescr}
                    />
                </label>

                {/* Active Status */}
                <label className="flex flex-row items-center font-medium text-primary-400">
                    <input type="checkbox" {...registerIsActive} className="mr-2 cursor-pointer" />
                    <span className="cursor-pointer">Is Active</span>
                </label>

                {/* Save */}
                <div className="mt-4 flex justify-start">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={(!_.isEmpty(errors)) || isSubmitting} />
                </div>
                <span>
                    {showServerValidationError()}
                </span>
            </div>
        </form>
    );

    async function getClientOptions(setOptions: (args: any) => void) {
        const q = GraphQLQueriesMap.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, { sqlId: SqlIdsMap.getAllClientNamesNoArgs })
        const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMap.genericQuery.name,)
        setOptions(res.data.genericQuery)
    }

    function handleOnChangeClient(selectedObject: any) {
        setValue('clientId', selectedObject?.id)
        clearErrors('clientId')
        validateUserEmailAtServer({})
    }

    async function onSubmit(data: FormDataType) {
        if (!(await validateUserEmailAtServer({}))) {
            return
        }
        if (!_.isEmpty(errors)) {
            return
        }
        const traceDataObject: TraceDataObjectType = {
            tableName: "UserM",
            xData: {
                ...data,
            }
        };
        try {
            const q: any = GraphQLQueriesMap.updateUser(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMap.updateUser.name;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({
                isOpen: false,
            });
            context.CompSyncFusionGrid[dataInstance].loadData();
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e.message);
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
        let ret: boolean = true
        const values: any = getValues()
        const userEmail: string = e?.target?.value || values?.userEmail
        if ((!userEmail) || (!values.clientId)) {
            return
        }
        const isValid = await trigger('userEmail')
        if(!isValid){
            return
        }
        try {
            const res: any = await Utils.queryGraphQL(
                GraphQLQueriesMap.genericQuery(
                    GLOBAL_SECURITY_DATABASE_NAME,
                    {
                        sqlId: SqlIdsMap.getUserIdOnClientIdEmail,
                        sqlArgs: {
                            id: id || null,
                            clientId: values.clientId,
                            userEmail: userEmail
                        }
                    }
                ),
                GraphQLQueriesMap.genericQuery.name);

            if (!_.isEmpty(res?.data?.genericQuery[0])) {
                setError("root.userEmail", {
                    type: "serverError",
                    message: Messages.errEmailExistsForClient
                });
                ret = false
            } else {
                clearErrors("root.userEmail");
            }
            return (ret)
        } catch (e: any) {
            console.log(e?.message)
        }
    }
}

type FormDataType = {
    clientId: string;
    userName: string;
    mobileNo: string;
    userEmail: string;
    descr: string;
    isActive: boolean;
    id?: string;
};

type SuperAdminNewEditAdminUserType = {
    clientId?: string;
    userName?: string;
    mobileNo?: string;
    userEmail?: string;
    descr?: string;
    isActive?: boolean;
    dataInstance: string;
    id?: string;
};
