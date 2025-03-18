import { useForm } from "react-hook-form";
import { Messages } from "../../../../../utils/messages";
import { useValidators } from "../../../../../utils/validators-hook";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { IconSubmit } from "../../../../../controls/icons/icon-submit";
import { IconReset } from "../../../../../controls/icons/icon-reset";
import { FormField } from "../../../../../controls/widgets/form-field";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { CompReactSelect } from "../../../../../controls/components/comp-react-select";
import { useSelector } from "react-redux";
import { allBranchesSelectorFn, BranchType } from "../../../../login/login-slice";

export function ProductsBranchTransferMain({ id }: { id?: string | number }) {
    console.log(id)
    const { branchId, branchName } = useUtilsInfo()
    const { checkAllowedDate } = useValidators()
    const {
        control
        , clearErrors
        , formState: { errors }
        , handleSubmit
        , register
        , setValue
        , watch,
    } = useForm<BranchTransferType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            // productLineItems: [{ productCode: "", productDetails: "", refNo: "", qty: 0, price: 0, lineRemarks: "", serialNo: "" }]
        }
    });
    const allBranches: BranchType[] = useSelector(allBranchesSelectorFn) || []
    const availableDestBranches = allBranches.filter((branch:BranchType)=>branch.branchId !== branchId)

    const formFields = {
        autoRefNo: watch('autoRefNo')
    }

    return (<div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 mr-6 ">

            {/* Header 1 */}
            <div className="flex items-center align-middle gap-8 flex-wrap">

                {/* Auto ref no */}
                <FormField label="Auto ref no" className="w-40">
                    <label className="border-b-2 mt-10 border-gray-200">{formFields.autoRefNo}</label>
                </FormField>

                {/* tran date */}
                <FormField label="Date" required error={errors.tranDate?.message}>
                    <input
                        type='date'
                        className='text-right rounded-lg h-10'
                        {...register('tranDate', {
                            required: Messages.errRequired,
                            validate: checkAllowedDate
                        })} />
                </FormField>

                {/* User ref no */}
                <FormField
                    label="Use ref no">
                    <input
                        type="text"
                        className={inputFormFieldStyles}
                        placeholder="Enter user ref no"
                        {...register('userRefNo')}
                    />
                </FormField>

                {/* Remarks */}
                <FormField className="min-w-96 w-auto"
                    label="Remarks">
                    <input
                        type="text"
                        className={inputFormFieldStyles}
                        placeholder="Enter remarks"
                        {...register('remarks')}
                    />
                </FormField>

                {/* Reset submit */}
                <div className="flex gap-6 ml-auto mt-8">
                    {/* Reset */}
                    <button onClick={handleReset} type="button" className="px-5 py-2 font-medium text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-200">
                        <IconReset className="text-white w-6 h-6 mr-2" />Reset</button>
                    {/* Submit */}
                    <button disabled={false} className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200">
                        <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit</button>
                </div>
            </div>

            {/* Header 2 */}
            <div className="grid grid-cols-2 gap-8 items-center mr-1">
                {/* Source branch */}
                <FormField className=""
                    label="Source branch">
                    <input
                        type="text"
                        disabled={true}
                        className='w-full rounded-lg border-gray-300 mt-1'
                        value={branchName}
                    />
                </FormField>

                {/* Dest branch */}
                <FormField label="Destination branch" required error={errors.destBranchId?.message}>
                    <CompReactSelect
                        menuPlacement="auto"
                        optionLabelName="branchName"
                        optionValueName="branchId"
                        placeHolder="Select dest branch ..."
                        {...register('destBranchId'
                            , { required: Messages.errRequired })}
                        onChange={handleOnChangeDestBranch}
                        ref={null}
                        staticOptions={availableDestBranches || []}
                        selectedValue={watch('destBranchId')}
                    />
                </FormField>
            </div>

        </form>
    </div>)

    function handleOnChangeDestBranch() {

    }

    function handleReset() {

    }

    async function onSubmit(data: BranchTransferType) {

    }

}

type BranchTransferType = {
    id?: string | number
    autoRefNo?: string
    destBranchId?: number
    linnItems: BranchTransferLineItem[]
    remarks?: string
    tranDate: string
    userRefNo?: string
}

type BranchTransferLineItem = {
    id?: number | string
    destBranchId: number
    jData: { [key: string]: any }
    price: number
    lineRefNo: string
    lineRemarks: string
    productId: number
    qty: number
}