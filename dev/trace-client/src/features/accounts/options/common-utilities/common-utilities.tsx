import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
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
        <label className="mt-3 text-lg font-medium text-primary-500">Common utilities</label>
        <div className="flex flex-col">
            <div className="flex mt-4 bg-slate-50 justify-between mr-6 py-2 px-4 items-center">
                <label className="text-primary-600 font-medium">{Messages.messTransferClosingBalance}</label>
                <button onClick={handleTransferClosingBalance} className="px-5 py-2 font-medium text-white inline-flex items-center bg-primary-500 hover:bg-primary-700 focus:ring-4 focus:outline-hidden focus:ring-red-300 rounded-lg text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 disabled:bg-red-200">
                    <IconTransfer className="text-white w-6 h-6 mr-2" /> Transfer
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