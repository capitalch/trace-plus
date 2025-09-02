import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { IconTransfer } from "../../../../controls/icons/icon-transfer";
import { Messages } from "../../../../utils/messages";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function CommonUtilities() {
    const {
        branchId
        , buCode
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()
    
    return (<CompAccountsContainer>
        <label className="mt-3 font-medium text-lg text-primary-500">Common utilities</label>
        <div className="flex flex-col">
            <div className="flex items-center justify-between mt-4 mr-6 px-4 py-2 bg-slate-50">
                <label className="font-medium text-primary-600">{Messages.messTransferClosingBalance}</label>
                <button onClick={handleTransferClosingBalance} className="inline-flex items-center px-5 py-2 font-medium text-center text-white rounded-lg hover:bg-primary-700 focus:outline-hidden focus:ring-4 focus:ring-red-300 disabled:bg-red-200 dark:bg-red-600 dark:focus:ring-red-800 dark:hover:bg-red-700 bg-primary-500">
                    <IconTransfer className="mr-2 w-6 h-6 text-white" /> Transfer
                </button>
            </div>
        </div>
    </CompAccountsContainer>)

    async function handleTransferClosingBalance() {
        Utils.showConfirmDialog('Warning', Messages.messSureToTransferClosingBalance, doTransfer)

        async function doTransfer() {
            try {
                await Utils.doGenericUpdateQuery({
                    buCode: buCode || '',
                    dbName: dbName || '',
                    sqlId: SqlIdsMap.upsertTransferClosingBalance,
                    dbParams: decodedDbParamsObject,
                    instance: DataInstancesMap.commonUtilsTransferClosingBalance,
                    sqlArgs: {
                        finYearId: finYearId,
                        branchId: branchId
                    }
                })
                Utils.showSaveMessage()
            } catch (e: any) {
                console.log(e)
            }
        }
    }
}