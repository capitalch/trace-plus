import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../../controls/widgets/widget-form-helper-text";
import { WidgetButtonSubmitFullWidth } from "../../../controls/widgets/widget-button-submit-full-width";
import { WidgetAstrix } from "../../../controls/widgets/widget-astrix";
// import { WidgetTooltip } from "../../../controls/widgets/widget-tooltip";
import { useEffect } from "react";
import { useValidators } from "../../../utils/validators-hook";
import { TraceDataObjectType } from "../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../app/global-constants";
import { Utils } from "../../../utils/utils";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../utils/ibuki";
// import { GlobalContextType } from "../../../app/global-context";
// import { GlobalContext } from "../../../App";
import { IbukiMessages } from "../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map";
import { InitialLoginStateType } from "../../login/login-slice";

export function ChangeUid() {
    const { checkNoSpecialChar } = useValidators();
    const { clearErrors, getValues, handleSubmit, register, setError, setValue, formState: { errors }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });
    // const context: GlobalContextType = useContext(GlobalContext);

    const registerCurrentUid = register("currentUid", {
        required: Messages.errRequired,
    });

    const registerUid = register("uid", {
        required: Messages.errRequired,
        validate: {
            noSpecialChar: checkNoSpecialChar
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 w-auto min-w-72">

                {/* Current UID */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Current UID <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. old-uid-123" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerCurrentUid}
                    />
                    <span className="flex justify-between">
                        {(errors.currentUid)
                            ? <WidgetFormErrorMessage errorMessage={errors.currentUid.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                    </span>
                </label>

                {/* New UID */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">New UID <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. new-uid-456" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerUid}
                    />
                    <span className="flex justify-between">
                        {(errors.uid)
                            ? <WidgetFormErrorMessage errorMessage={errors.uid.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}

                    </span>
                </label>

                {/* Save */}
                <div className="mt-4 flex justify-start">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors)} />
                </div>
            </div>
        </form>
    );

    async function changeUid(data: FormDataType) {
        const loginInfo:InitialLoginStateType = Utils.getCurrentLoginInfo()
        
        try {
            const dataWithId = {
                ...data,
                id: loginInfo.id,
                email: loginInfo.email
            }
            const q: any = GraphQLQueriesMap.changeUid(dataWithId)
            const qName: string = GraphQLQueriesMap.changeUid.name
            await Utils.mutateGraphQL(q, qName)
            Utils.showHideModalDialogA({ isOpen: false })
            Utils.showSaveMessage()
        } catch (e: any) {
            console.log(e)
        }
    }

    async function onSubmit(data: FormDataType) {
        const currentUid = data?.currentUid
        const uid = data?.uid
        if (currentUid && uid && (currentUid !== uid)) {
            changeUid(data)
        } else {
            Utils.showAlertMessage('Alert', Messages.errSameCurrentUidAndNewUid)
        }

        // const traceDataObject: TraceDataObjectType = {
        //     tableName: "UidChange",
        //     xData: {
        //         ...data,
        //     }
        // };
        // try {
        //     const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
        //     const queryName: string = GraphQLQueriesMap.genericUpdate.name;
        //     await Utils.mutateGraphQL(q, queryName);
        //     Utils.showHideModalDialogA({
        //         isOpen: false,
        //     });
        //     Utils.showSaveMessage()
        // } catch (e: any) {
        //     console.log(e.message);
        // }
    }
}

type FormDataType = {
    currentUid: string;
    uid: string;
    // id?: string;
};
