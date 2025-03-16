import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../controls/components/comp-tabs";
import { ProductsBranchTransferView } from "./products-branch-transfer-view";

export function ProductsBranchTransfers() {
    return (<CompAccountsContainer>
        <label className="mt-3 text-lg font-medium text-primary-500">Branch Transfer</label>
        <CompTabs tabsInfo={tabsInfo} className="mt-4" />
    </CompAccountsContainer>)
}

const tabsInfo: CompTabsType = [
    {
        label: 'Main',
        content: <div>Content1</div>
    },
    {
        label: 'View',
        content: <ProductsBranchTransferView />
    }
]