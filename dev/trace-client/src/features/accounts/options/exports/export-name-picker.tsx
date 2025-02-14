// import { useState } from "react";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { useDispatch, useSelector } from "react-redux";
import { setExportName } from "../../accounts-slice";
// import { CompSwitch } from "../../../../controls/redux-components/comp-switch";
// import { CompInstances } from "../../../../controls/redux-components/comp-instances";

export function ExportNamePicker() {
    const dispatch: AppDispatchType = useDispatch()
    const selectedExport = useSelector((state: RootStateType) => state.accounts.exports.exportName)
    return (
        <div>
            {/* <div className="flex space-x-4"> */}
                <label className="text-lg font-medium text-primary-500">Select Export Type</label>
                
            {/* </div> */}
            <div className="flex flex-wrap justify-start gap-4">
                {exportNameOptions.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer py-2">
                        <input
                            type="radio"
                            name="export"
                            value={option.value}
                            checked={selectedExport === option.value}
                            onChange={() => handleExportChange(option.value)}
                            className="text-indigo-600"
                        />
                        {option.display}
                    </label>
                ))}
            </div>
        </div>
    );

    function handleExportChange(value: string) {
        dispatch(setExportName(value))
        // setSelectedExport(value);
    }
}

const exportNameOptions: ExportNameOptionType[] = [
    { display: 'Accounts Master', value: 'accountsMaster' },
    { display: 'All Vouchers', value: 'allVouchers' },
    { display: 'Contra', value: 'contra' },
    { display: 'Final Accounts', value: 'finalAccounts' },
    { display: 'Gst', value: 'gst' },
    { display: 'Journals', value: 'journals' },
    { display: 'Payments', value: 'payments' },
    { display: 'Receipts', value: 'receipts' },
    { display: 'Trial Balance', value: 'trialBalance' },
];

type ExportNameOptionType = {
    display: string
    value: string
}