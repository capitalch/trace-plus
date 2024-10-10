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
import { GlobalContextType } from "../../../../app/global-context";
import { GlobalContext } from "../../../../App";
import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";

export function SuperAdminEditNewAdminUser({
    clientName,
    uid,
    userName,
    mobileNo,
    userEmail,
    remarks,
    isActive,
    timestamp,
    dataInstance,
    id,
}: SuperAdminEditNewAdminUserType) {
    const { checkNoSpecialChar, checkEmail } = useValidators();
    const { clearErrors, handleSubmit, register, setError, setValue, formState: { errors }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });
    const context: GlobalContextType = useContext(GlobalContext);

    const registerClientName = register("clientName", {
        required: Messages.errRequired,
        validate: {
            noSpecialChar: checkNoSpecialChar
        },
        onChange: (e: any) => {
            ibukiDdebounceEmit(IbukiMessages["DEBOUNCE-CLIENT-NAME"], { clientName: e.target.value });
        }
    });

    const registerUid = register("uid", {
        required: Messages.errRequired,
    });

    const registerUserName = register("userName", {
        required: Messages.errRequired,
    });

    const registerMobileNo = register("mobileNo", {
        required: Messages.errRequired,
    });

    const registerUserEmail = register("userEmail", {
        required: Messages.errRequired,
        validate: {
            validEmail: checkEmail
        }
    });

    const registerRemarks = register("remarks");

    const registerIsActive = register("isActive");

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-CLIENT-NAME"], 1200).subscribe((d: any) => {
            validateClientNameAtServer(d.data);
        });
        setValue("clientName", clientName || "");
        setValue("uid", uid || "");
        setValue("userName", userName || "");
        setValue("mobileNo", mobileNo || "");
        setValue("userEmail", userEmail || "");
        setValue("remarks", remarks || "");
        setValue("isActive", isActive || false);
        setValue("timestamp", timestamp || "");
        setValue("id", id);

        return () => {
            subs1.unsubscribe();
        };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 w-auto min-w-72">

                {/* Client Name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Client Name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. Acme Corp" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerClientName}
                    />
                    {errors.clientName && <WidgetFormErrorMessage errorMessage={errors.clientName.message} />}
                </label>

                {/* UID */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User ID <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. 12345" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerUid}
                    />
                    {errors.uid && <WidgetFormErrorMessage errorMessage={errors.uid.message} />}
                </label>

                {/* User Name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User Name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. John Doe" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerUserName}
                    />
                    {errors.userName && <WidgetFormErrorMessage errorMessage={errors.userName.message} />}
                </label>

                {/* Mobile Number */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Mobile Number <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. +1234567890" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerMobileNo}
                    />
                    {errors.mobileNo && <WidgetFormErrorMessage errorMessage={errors.mobileNo.message} />}
                </label>

                {/* Email */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User Email <WidgetAstrix /></span>
                    <input type="email" placeholder="e.g. john@example.com" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerUserEmail}
                    />
                    {errors.userEmail && <WidgetFormErrorMessage errorMessage={errors.userEmail.message} />}
                </label>

                {/* Remarks */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Remarks</span>
                    <input type="text" placeholder="e.g. Important user" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerRemarks}
                    />
                </label>

                {/* Active Status */}
                <label className="flex flex-row items-center font-medium text-primary-400">
                    <input type="checkbox" {...registerIsActive} className="mr-2" />
                    <span>Is Active</span>
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
            tableName: "AdminUser",
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
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e.message);
        } finally {
            Utils.showAppLoader(false);
        }
    }

    function showServerValidationError() {
        let Ret = <></>;
        if (errors?.root?.clientName) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.clientName.message} />;
        } else {
            Ret = <WidgetFormHelperText helperText="&nbsp;" />;
        }
        return Ret;
    }

    async function validateClientNameAtServer(value: any) {
        // const res: any = await Utils.queryGraphQL(
        //     GraphQLQueriesMap.genericQuery(
        //         GLOBAL_SECURITY_DATABASE_NAME,
        //         {
        //             sqlId: SqlIdsMap.getSuperAdminClientOnClientName,
        //             sqlArgs: { clientName: value?.clientName }
        //         }),
        //     GraphQLQueriesMap.genericQuery.name);
        // if (res?.data?.genericQuery[0]) {
        //     setError("root.clientName", {
        //         type: "serverError",
        //         message: Messages.errSuperAdminClientNameExists
        //     });
        // } else {
        //     clearErrors("root.clientName");
        // }
    }
}

type FormDataType = {
    clientName: string;
    uid: string;
    userName: string;
    mobileNo: string;
    userEmail: string;
    remarks: string;
    isActive: boolean;
    timestamp: string;
    id?: string;
};

type SuperAdminEditNewAdminUserType = {
    clientName?: string;
    uid?: string;
    userName?: string;
    mobileNo?: string;
    userEmail?: string;
    remarks?: string;
    isActive?: boolean;
    timestamp?: string;
    dataInstance: string;
    id?: string;
};
