import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useValidators } from "../../../../utils/validators-hook";
import { useForm } from "react-hook-form";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";
import { changeAccSettings } from "../../accounts-slice";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";

export function NewEditBrand({ props }: { props: NewEditBrandType }) {
    const { id, brandName, remarks } = props;
    const instance: string = DataInstancesMap.brandMaster;
    const dispatch: AppDispatchType = useDispatch();
    const { buCode, context } = useUtilsInfo();
    const { checkNoSpecialChar } = useValidators();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<NewEditBrandType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: { id, brandName, remarks },
    });

    async function onSubmit(data: NewEditBrandType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo);
            return;
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: AllTables.BrandM.name,
                xData: {
                    id: data.id,
                    brandName: data.brandName,
                    remarks: data.remarks
                }
            });
            Utils.showSaveMessage();
            dispatch(changeAccSettings());
            dispatch(closeSlidingPane());
            const loadData = context.CompSyncFusionGrid[instance].loadData;
            if (loadData) await loadData();
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-auto mt-2 mr-6 mb-2">
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Brand Name <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. Nike"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register('brandName', {
                        required: Messages.errRequired,
                        validate: checkNoSpecialChar
                    })}
                />
                {errors.brandName && <WidgetFormErrorMessage errorMessage={errors.brandName.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
                <span className="font-bold">Remarks</span>
                <textarea
                    placeholder="Add any remarks here..."
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register('remarks')}
                />
            </label>

            <div className="sm:col-span-2 mt-4">
                <WidgetButtonSubmitFullWidth label="Submit" disabled={isSubmitting || !_.isEmpty(errors)} />
            </div>
        </form>
    );
}

export type NewEditBrandType = {
    id?: number;
    brandName: string;
    remarks?: string;
};