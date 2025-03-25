import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { ProductsBranchTransferMain } from "./products-branch-transfer-main/products-branch-transfer-main";
// import { ProductsBranchTransferMain } from "./products-branch-transfer-main";
import { ProductsBranchTransferView } from "./products-branch-transfer-view";

export function ProductsBranchTransfers() {

    return (<CompAccountsContainer>
        <label className="mt-3 text-lg font-medium text-primary-500">Branch Transfer</label>
        <CompTabs tabsInfo={tabsInfo} className="mt-4" instance={instance} />
    </CompAccountsContainer>)
}
const instance = DataInstancesMap.productsBranchTransfer
const tabsInfo: CompTabsType = [
    {
        label: 'Main',
        content: <ProductsBranchTransferMain instance={instance} />
    },
    {
        label: 'View',
        content: <ProductsBranchTransferView />
    }
]