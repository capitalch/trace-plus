import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store/store";
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
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import Select from "react-select";

export function NewEditProduct({ props }: any) {
    const { id, catId, brandId, unitId, label, productCode, hsn, upcCode, gstRate, salePrice, isActive, maxRetailPrice, dealerPrice, salePriceGst, purPriceGst, purPrice, info } = props;
    const instance: string = DataInstancesMap.productMaster;
    const dispatch: AppDispatchType = useDispatch();
    const { buCode, context } = useUtilsInfo();

    const {
        checkNoSpaceOrSpecialChar,
        checkNoSpecialChar
    } = useValidators();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<NewEditProductType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id,
            catId,
            brandId,
            unitId,
            label,
            productCode,
            hsn,
            upcCode,
            gstRate,
            salePrice,
            isActive,
            maxRetailPrice,
            dealerPrice,
            salePriceGst,
            purPriceGst,
            purPrice,
            info
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-auto mt-2 mr-6 mb-2"
        >
            {/* Category */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Category <WidgetAstrix /></span>
                <Select
                    placeholder="Select Category"
                    options={[]} // Load dynamically
                    className="mt-1"
                />
            </label>
            
            {/* Brand */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Brand <WidgetAstrix /></span>
                <Select
                    placeholder="Select Brand"
                    options={[]} // Load dynamically
                    className="mt-1"
                />
            </label>
            
            {/* Product Label */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Label <WidgetAstrix /></span>
                <input
                    type="text"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                    {...register('label', {
                        required: Messages.errRequired,
                        validate: checkNoSpecialChar
                    })}
                />
                {errors.label && <WidgetFormErrorMessage errorMessage={errors.label.message} />}
            </label>
            
            {/* Product Code */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Product Code <WidgetAstrix /></span>
                <input
                    type="text"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                    {...register('productCode', {
                        required: Messages.errRequired,
                        validate: checkNoSpaceOrSpecialChar
                    })}
                />
                {errors.productCode && <WidgetFormErrorMessage errorMessage={errors.productCode.message} />}
            </label>
            
            {/* Submit Button */}
            <div className="sm:col-span-2 mt-4">
                <WidgetButtonSubmitFullWidth label="Submit" className="" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
            </div>
        </form>
    );

    async function onSubmit(data: NewEditProductType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo);
            return;
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: DatabaseTablesMap.ProductM,
                xData: data
            });
            Utils.showSaveMessage();
            dispatch(changeAccSettings());
            dispatch(closeSlidingPane());
            const loadData = context.CompSyncFusionGrid[instance].loadData;
            if (loadData) {
                await loadData();
            }
        } catch (e: any) {
            console.log(e);
        }
    }
}

export type NewEditProductType = {
    id?: number;
    catId?: number;
    brandId?: number;
    unitId?: number;
    label: string;
    productCode: string;
    hsn?: string;
    upcCode?: string;
    gstRate?: number;
    salePrice?: number;
    isActive?: boolean;
    maxRetailPrice?: number;
    dealerPrice?: number;
    salePriceGst?: number;
    purPriceGst?: number;
    purPrice?: number;
    info?: string;
};
