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

export function SuperAdminNewEditSecuredControl({
    controlName,
    controlNo,
    controlType,
    dataInstance,
    descr,
    id,
}: SuperAdminNewEditSecuredControlType) {
    const { checkNoSpaceOrSpecialChar, shouldBePositive, shouldNotBeZero } = useValidators();
    const { clearErrors, handleSubmit, register, setError, setValue, trigger, formState: { errors }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });
    const context: GlobalContextType = useContext(GlobalContext);

    const registerControlName = register("controlName", {
        required: Messages.errRequired
        , validate: {
            noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar
        },
        onChange: (e: any) => {
            ibukiDdebounceEmit(IbukiMessages["DEBOUNCE-SECURED-CONTROL-NAME"], { controlName: e.target.value });
        }
    });

    const registerControlNo = register("controlNo", {
        required: Messages.errRequired
        , validate: {
            shouldNotBeZero: shouldNotBeZero,
            shouldBePositive: shouldBePositive
        }
    });

    const registerControlType = register("controlType", {
        required: Messages.errRequired
        , validate: {
            noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar
        },
    });

    const registerDescr = register("descr");

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-SECURED-CONTROL-NAME"], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('controlName')
            if (isValid) {
                validateControlNameAtServer(d.data);
            }
        });
        setValue("controlName", controlName || "");
        setValue("controlNo", controlNo || 0);
        setValue("controlType", controlType || "");
        setValue("id", id);
        setValue("descr", descr || undefined);

        return () => {
            subs1.unsubscribe();
        };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-auto min-w-72 gap-2">

                {/* Control name */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Control name <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. ViewReports" autoComplete="off"
                        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerControlName}
                    />
                    <span className="flex justify-between">
                        {errors.controlName
                            ? <WidgetFormErrorMessage errorMessage={errors.controlName.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <TooltipComponent content={Messages.messSecuredControlName} className="font-normal text-blue-500! text-sm bg-white border-2 border-gray-200 -top-5!">
                            <span className="ml-auto text-primary-400 text-xs hover:cursor-pointer">?</span>
                        </TooltipComponent>
                    </span>
                </label>

                {/* Control No */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Control number <WidgetAstrix /></span>
                    <input type="number" placeholder="e.g. 001" autoComplete="off" onFocus={(event) => event.target.select()}
                        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerControlNo}
                    />
                    {errors.controlNo && <WidgetFormErrorMessage errorMessage={errors.controlNo.message} />}
                </label>

                {/* Control Type */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Control type <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. menu" autoComplete="off"
                        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerControlType}
                    />
                    {errors.controlType && <WidgetFormErrorMessage errorMessage={errors.controlType.message} />}
                </label>

                {/* Description */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Control description</span>
                    <input type="text" placeholder="e.g. Allows viewing of all reports" autoComplete="off"
                        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                        {...registerDescr}
                    />
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
            tableName: AllTables.SecuredControlM.name,
            xData: {
                ...data,
            }
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
        if (errors?.root?.controlName) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.controlName.message} />;
        } else {
            Ret = <WidgetFormHelperText helperText="&nbsp;" />;
        }
        return Ret;
    }

    async function validateControlNameAtServer(value: any) {
        const res: any = await Utils.queryGraphQL(
            GraphQLQueriesMap.genericQuery(
                GLOBAL_SECURITY_DATABASE_NAME,
                {
                    sqlId: SqlIdsMap.getSuperAdminControlOnControlName,
                    sqlArgs: { controlName: value?.controlName }
                }),
            GraphQLQueriesMapNames.genericQuery);
        if (res?.data?.genericQuery[0]) {
            setError("root.controlName", {
                type: "serverError",
                message: Messages.errSuperAdminControlNameExists
            });
        } else {
            clearErrors("root.controlName");
        }
    }
}

type FormDataType = {
    descr: string | undefined;
    controlName: string;
    controlNo: number;
    controlType: string;
    id?: string;
};

type SuperAdminNewEditSecuredControlType = {
    dataInstance: string;
    descr?: string | undefined;
    controlName?: string;
    controlNo?: number;
    controlType?: string;
    id?: string;
};
