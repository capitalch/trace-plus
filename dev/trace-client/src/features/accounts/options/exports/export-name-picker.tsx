import { useState } from "react";

export function ExportNamePicker() {
    const [selectedExport, setSelectedExport] = useState<string>('');
    return (
        <div>
            <label className="text-lg font-medium text-primary-500">Select Export Type</label>
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
        setSelectedExport(value);
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