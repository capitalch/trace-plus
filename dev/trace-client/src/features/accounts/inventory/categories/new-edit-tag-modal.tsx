import { useDispatch } from "react-redux";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { AppDispatchType } from "../../../../app/store/store";
import { useForm } from "react-hook-form";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { changeAccSettings } from "../../accounts-slice";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
// import _ from "lodash";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";

export function NewEditTagModal({ id, tagName }: NewEditTagType) {
    const dispatch: AppDispatchType = useDispatch();
    const instance: string = DataInstancesMap.newEditTag;
    const { buCode, context } = useUtilsInfo();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<NewEditTagType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: { id, tagName },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-y-4 w-96 mt-2 mb-2">

            {/* Tag Name */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">
                    Tag Name <WidgetAstrix />
                </span>
                <input
                    type="text"
                    placeholder="e.g. Urgent"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register("tagName", {
                        required: Messages.errRequired,
                    })}
                />
                {errors.tagName && (
                    <WidgetFormErrorMessage errorMessage={errors.tagName.message} />
                )}
            </label>

            {/* Submit */}
            <WidgetButtonSubmitFullWidth
                label="Submit"
                className="max-w-96 mt-4"
                disabled={isSubmitting || !isDirty}
            />
        </form>
    );

    async function onSubmit(data: NewEditTagType) {
        if (!isDirty) {
            Utils.showAlertMessage("Warning", Messages.messNothingToDo);
            return;
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || "",
                tableName: DatabaseTablesMap.TagsM,
                xData: { id: data.id, tagName: data.tagName },
            });
            Utils.showSaveMessage();
            // dispatch(changeAccSettings());
            Utils.showHideModalDialogA({ isOpen: false });
            const loadData = context.CompSyncFusionGrid[instance].loadData;
            if (loadData) {
                await loadData();
            }
        } catch (e: any) {
            console.log(e);
        }
    }
}

export type NewEditTagType = {
    id?: number;
    tagName: string;
};
