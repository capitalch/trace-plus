import { WidgetButtonSubmitFullWidth } from "../../../controls/widgets/widget-button-submit-full-width"
import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../../controls/widgets/widget-form-helper-text";
import { WidgetAstrix } from "../../../controls/widgets/widget-astrix";
import { useValidators } from "../../../utils/validators-hook";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../app/graphql/maps/graphql-queries-map";
import { Utils } from "../../../utils/utils";
import { doLogout, LoginType } from "../../login/login-slice";
import { AppDispatchType } from "../../../app/store";
import { useDispatch } from "react-redux";

export function ChangePassword() {
    const { checkPassword } = useValidators();
    const dispatch: AppDispatchType = useDispatch()
    const loginInfo: LoginType = Utils.getCurrentLoginInfo();
    const { getValues, handleSubmit, register, formState: { errors }, } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError",
    });

    const registerCurrentPwd = register("currentPwd", {
        required: Messages.errRequired,
    });

    const registerPwd = register("pwd", {
        required: Messages.errRequired,
        validate: {
            checkPassword, checkNotSameAsCurrentPwd
        },
        minLength: { value: 8, message: Messages.errAtLeast8Chars },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 w-auto min-w-72">

                {/* Current Password */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Current Password <WidgetAstrix /></span>
                    <input type="password" placeholder="Enter current password" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerCurrentPwd}
                    />
                    <span className="flex justify-between">
                        {(errors.currentPwd)
                            ? <WidgetFormErrorMessage errorMessage={errors.currentPwd.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                    </span>
                </label>

                {/* New Password */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">New Password <WidgetAstrix /></span>
                    <input type="password" placeholder="Enter new password" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerPwd}
                    />
                    <span className="flex justify-between">
                        {(errors.pwd)
                            ? <WidgetFormErrorMessage errorMessage={errors.pwd.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                    </span>
                    <WidgetFormHelperText helperText={Messages.messPasswordHelper} />
                </label>

                {/* Save */}
                <div className="mt-4 flex justify-start">
                    <WidgetButtonSubmitFullWidth label="Save" disabled={!_.isEmpty(errors)} />
                </div>
            </div>
        </form>
    );

    async function doChangePassword(data: FormDataType) {
        try {
            const dataWithId = {
                ...data,
                id: loginInfo.userDetails?.id,
                email: loginInfo.userDetails?.userEmail,
                userName: loginInfo.userDetails?.userName,
            };
            const q: any = GraphQLQueriesMap.changePwd(dataWithId);
            const qName: string = GraphQLQueriesMapNames.changePwd;
            await Utils.mutateGraphQL(q, qName);
            Utils.showHideModalDialogA({ isOpen: false });
            Utils.showSaveMessage();
            dispatch(doLogout())
        } catch (e: any) {
            console.log(e);
        }
    }

    async function onSubmit(data: FormDataType) {
        const currentPwd = data?.currentPwd;
        const pwd = data?.pwd;
        if (currentPwd && pwd && (currentPwd !== pwd)) {
            doChangePassword(data);
        } else {
            Utils.showAlertMessage('Alert', Messages.errSameCurrentPwdAndNewPwd);
        }
    }

    function checkNotSameAsCurrentPwd(input: string) {
        const values = getValues()
        const currentPwd: string = values.currentPwd
        let error = undefined;
        if (input === currentPwd) {
            error = Messages.errCurrentAndNewPwdCannotBeSame;
        }
        return error;
    }
}

type FormDataType = {
    currentPwd: string;
    pwd: string;
};
