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
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki";
import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

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
            <div className="flex flex-col min-w-72 gap-2">

                {/* Business Unit Code */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Business Unit Code <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. BU123" autoComplete="off" disabled={id ? true : false}
                        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerBuCode}
                    />
                    <span className="flex justify-between">
                        {(errors.buCode)
                            ? <WidgetFormErrorMessage errorMessage={errors.buCode.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <TooltipComponent content={Messages.messBuCode} className="font-normal text-blue-500! text-sm bg-white border-2 border-gray-200 -top-5!">
                            <span className="ml-auto text-primary-400 text-xs hover:cursor-pointer">?</span>
                        </TooltipComponent>
                    </span>
                </label>

                {/* Business Unit Name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Business Unit Name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. Sales Department" autoComplete="off"
                        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerBuName}
                    />
                    <span className="flex justify-between">
                        {(errors.buName)
                            ? <WidgetFormErrorMessage errorMessage={errors.buName.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <TooltipComponent content={Messages.messBuName} className="font-normal text-blue-500! text-sm bg-white border-2 border-gray-200 -top-5!">
                            <span className="ml-auto text-primary-400 text-xs hover:cursor-pointer">?</span>
                        </TooltipComponent>
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
                <div className="flex justify-start mt-4">
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
            tableName: AllTables.BuM.name,
            xData: {
                ...data,
                clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId
            }
        };
        try {
            const q: any = GraphQLQueriesMap.createBu(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.createBu;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({
                isOpen: false,
            });
            await loadData()
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e);
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
            GraphQLQueriesMapNames.genericQuery);
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
