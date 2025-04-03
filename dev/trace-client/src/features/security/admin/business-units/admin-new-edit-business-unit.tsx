import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetTooltip } from "../../../../controls/widgets/widget-tooltip";
import { useEffect } from "react";
import { useValidators } from "../../../../utils/validators-hook";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki";
import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";

export function AdminNewEditBusinessUnit({
    buCode,
    buName,
    isActive,
    id,
    loadData,
}: AdminNewEditBusinessUnitType) {
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar } = useValidators();
    const { clearErrors, handleSubmit, register, setError, setValue, trigger, formState: { errors }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });

    const registerBuCode = register("buCode", {
        minLength: { value: 4, message: Messages.errAtLeast4Chars },
        maxLength: { value: 50, message: Messages.errAtMost50Chars },
        required: Messages.errRequired,
        validate: {
            noSpaceOrpecialChar: checkNoSpaceOrSpecialChar
        },
        onChange: (e: any) => {
            ibukiDdebounceEmit(IbukiMessages["DEBOUNCE-BU-CODE"], { buCode: e.target.value });
        }
    });

    const registerBuName = register("buName",
        {
            minLength: { value: 6, message: Messages.errAtLeast6Chars },
            maxLength: { value: 150, message: Messages.errAtMost150Chars },
            required: Messages.errRequired,
            validate: {
                nopecialChar: checkNoSpecialChar
            },
        }
    );

    const registerIsActive = register("isActive");

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-BU-CODE"], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('buCode')
            if (isValid) {
                validateBuCodeAtServer(d.data);
            }
        });
        setValue("buCode", buCode || "");
        setValue("buName", buName || "");
        setValue("isActive", isActive || false);
        setValue("id", id);

        return () => {
            subs1.unsubscribe();
        };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="flex flex-col gap-2 min-w-72">

                {/* Business Unit Code */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Business Unit Code <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. BU123" autoComplete="off" disabled={id ? true : false}
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerBuCode}
                    />
                    <span className="flex justify-between">
                        {(errors.buCode)
                            ? <WidgetFormErrorMessage errorMessage={errors.buCode.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <WidgetTooltip title={Messages.messBuCode} className="font-normal text-sm -top-5! bg-white text-blue-500! border-gray-200 border-2">
                            <span className="ml-auto text-xs text-primary-400 hover:cursor-pointer">?</span>
                        </WidgetTooltip>
                    </span>
                </label>

                {/* Business Unit Name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Business Unit Name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. Sales Department" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerBuName}
                    />
                    <span className="flex justify-between">
                        {(errors.buName)
                            ? <WidgetFormErrorMessage errorMessage={errors.buName.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <WidgetTooltip title={Messages.messBuName} className="font-normal text-sm -top-5! bg-white text-blue-500! border-gray-200 border-2">
                            <span className="ml-auto text-xs text-primary-400 hover:cursor-pointer">?</span>
                        </WidgetTooltip>
                    </span>
                </label>

                {/* Is Active */}
                <label className="flex items-center font-medium text-primary-400">
                    <input type="checkbox" className="mr-2 cursor-pointer"
                        {...registerIsActive}
                    />
                    <span className="cursor-pointer">Is Active</span>
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
            tableName: DatabaseTablesMap.BuM,
            xData: {
                ...data,
                clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId
            }
        };
        try {
            const q: any = GraphQLQueriesMap.createBu(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMap.createBu.name;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({
                isOpen: false,
            });
            await loadData()
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e.message);
        }
    }

    function showServerValidationError() {
        let Ret = <></>;
        if (errors?.root?.buCode) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.buCode.message} />;
        } else {
            Ret = <WidgetFormHelperText helperText="&nbsp;" />;
        }
        return Ret;
    }

    async function validateBuCodeAtServer(value: any) {
        const res: any = await Utils.queryGraphQL(
            GraphQLQueriesMap.genericQuery(
                GLOBAL_SECURITY_DATABASE_NAME,
                {
                    sqlId: SqlIdsMap.getBuOnBuCodeAndClientId,
                    sqlArgs: { buCode: value?.buCode, clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId }
                }),
            GraphQLQueriesMap.genericQuery.name);
        if (res?.data?.genericQuery[0]) {
            setError("root.buCode", {
                type: "serverError",
                message: Messages.errBuCodeExists
            });
        } else {
            clearErrors("root.buCode");
        }
    }
}

type FormDataType = {
    buCode: string;
    buName: string;
    isActive: boolean;
    id?: string;
};

type AdminNewEditBusinessUnitType = {
    buCode?: string;
    buName?: string;
    isActive?: boolean;
    id?: string;
    loadData: () => void
};
