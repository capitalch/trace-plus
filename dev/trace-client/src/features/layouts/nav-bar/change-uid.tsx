import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../../controls/widgets/widget-form-helper-text";
import { WidgetButtonSubmitFullWidth } from "../../../controls/widgets/widget-button-submit-full-width";
import { WidgetAstrix } from "../../../controls/widgets/widget-astrix";
import { useValidators } from "../../../utils/validators-hook";
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map";
import { Utils } from "../../../utils/utils";
import { InitialLoginStateType, setUid } from "../../login/login-slice";
import { AppDispatchType } from "../../../app/store/store";
import { useDispatch } from "react-redux";

export function ChangeUid() {
    const { checkNoSpaceOrSpecialChar } = useValidators();
    const dispatch: AppDispatchType = useDispatch()
    const loginInfo: InitialLoginStateType = Utils.getCurrentLoginInfo()
    const { handleSubmit, register, formState: { errors }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });

    const registerCurrentUid = register("currentUid", {
        required: Messages.errRequired,
        value: loginInfo.uid
    });

    const registerUid = register("uid", {
        required: Messages.errRequired,
        validate: {
            noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar,
            notSameAsCurrentUid: checkNotSameAsCurrentUid,
        },
        minLength: { value: 4, message: Messages.errAtLeast4Chars },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 w-auto min-w-72">

                {/* Current UID */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Current UID <WidgetAstrix /></span>
                    <input type="text" placeholder="e.g. old-uid-123" autoComplete="off" disabled={true}
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic disabled:bg-slate-100"
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
                    <WidgetFormHelperText helperText={Messages.messUidHelper} />
                </label>

                {/* Save */}
                <div className="mt-4 flex justify-start">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors)} />
                </div>
            </div>
        </form>
    );

    async function doChangeUid(data: FormDataType) {
        try {
            const dataWithId = {
                ...data,
                id: loginInfo.id,
                email: loginInfo.email,
                userName: loginInfo.userName
            }
            const q: any = GraphQLQueriesMap.changeUid(dataWithId)
            const qName: string = GraphQLQueriesMap.changeUid.name
            await Utils.mutateGraphQL(q, qName)
            dispatch(setUid({ uid: data.uid }))
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
            doChangeUid(data)
        } else {
            Utils.showAlertMessage('Alert', Messages.errSameCurrentUidAndNewUid)
        }
    }

    function checkNotSameAsCurrentUid(input: string) {
        let error = undefined
        if (input === loginInfo.uid) {
            error = Messages.errCurrentAndNewUidCannotBeSame
        }
        return (error)
    }
}

type FormDataType = {
    currentUid: string;
    uid: string;
};
