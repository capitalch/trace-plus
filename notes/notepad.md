<div className="flex flex-col gap-8 mt-6 mr-6">

            {/* 💳 Credit Section */}
            <div>
                <h3 className="text-md font-semibold mb-2 text-secondary-400">Credit Entries</h3>
                <div className="flex flex-col gap-4">
                    {creditFields.map((_, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 items-start bg-gray-50 p-4 rounded shadow-sm">
                            <FormField label="Credit Account">
                                <AccountPickerFlat
                                    accClassNames={['cash', 'bank', 'ecash', 'card']}
                                    instance={`${instance}-credit-${index}`}
                                    {...register(`creditEntries.${index}.accId`, { required: Messages.errRequired })}
                                    onChange={(val) => setValue(`creditEntries.${index}.accId`, val)}
                                    value={watch(`creditEntries.${index}.accId`)}
                                    className="w-full"
                                />
                            </FormField>

                            <FormField label="Instr No" error={errors?.creditEntries?.[index]?.instrNo}>
                                <input
                                    type="text"
                                    {...register(`creditEntries.${index}.instrNo`)}
                                    className={clsx("border p-2 rounded text-xs h-10 w-full", inputFormFieldStyles)}
                                />
                            </FormField>

                            <FormField label="Line Ref No" error={errors?.creditEntries?.[index]?.lineRefNo}>
                                <input
                                    type="text"
                                    {...register(`creditEntries.${index}.lineRefNo`)}
                                    className={clsx("border p-2 rounded text-xs h-10 w-full", inputFormFieldStyles)}
                                />
                            </FormField>

                            <FormField label="Line Remarks">
                                <textarea
                                    rows={2}
                                    className={clsx(inputFormFieldStyles, "text-xs w-full")}
                                    placeholder="Remarks"
                                    {...register(`creditEntries.${index}.lineRemarks`)}
                                />
                            </FormField>
                        </div>
                    ))}
                </div>
            </div>
            
             {/* 💰 Debit Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold text-secondary-400">Debit Entries</h3>
                    <button
                        type="button"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                        onClick={() =>
                            append({
                                accId: null,
                                amount: 0,
                                dc: "D",
                                entryId: null,
                                tranHeaderId: null,
                                instrNo: "",
                                lineRefNo: "",
                                lineRemarks: "",
                            })
                        }
                    >
                        <IconPlus /> Add Entry
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {debitFields.map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-4 gap-4 items-start bg-white p-4 border rounded relative"
                        >
                            <FormField label="Debit Account">
                                <AccountPickerFlat
                                    accClassNames={['debtor', 'creditor', 'dexp', 'iexp']}
                                    instance={`${instance}-debit-${index}`}
                                    {...register(`debitEntries.${index}.accId`, { required: Messages.errRequired })}
                                    onChange={(val) => setValue(`debitEntries.${index}.accId`, val)}
                                    value={watch(`debitEntries.${index}.accId`)}
                                    className="w-full"
                                />
                            </FormField>

                            <FormField label="Instr No" error={errors?.debitEntries?.[index]?.instrNo}>
                                <input
                                    type="text"
                                    {...register(`debitEntries.${index}.instrNo`)}
                                    className={clsx("border p-2 rounded text-xs h-10 w-full", inputFormFieldStyles)}
                                />
                            </FormField>

                            <FormField label="Line Ref No" error={errors?.debitEntries?.[index]?.lineRefNo}>
                                <input
                                    type="text"
                                    {...register(`debitEntries.${index}.lineRefNo`)}
                                    className={clsx("border p-2 rounded text-xs h-10 w-full", inputFormFieldStyles)}
                                />
                            </FormField>

                            <FormField label="Line Remarks">
                                <textarea
                                    rows={2}
                                    className={clsx(inputFormFieldStyles, "text-xs w-full")}
                                    placeholder="Remarks"
                                    {...register(`debitEntries.${index}.lineRemarks`)}
                                />
                            </FormField>

                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => remove(index)}
                            >
                                <IconCross className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
           
        </div>