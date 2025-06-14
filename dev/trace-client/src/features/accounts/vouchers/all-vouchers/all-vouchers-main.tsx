import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";

export function AllVouchersMain() {
    const instance = DataInstancesMap.allVouchers;
    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <></>
        },
        {
            label: "View",
            content: <></>
        }
    ];
    return (
        <CompAccountsContainer>
            <label className="mt-1 text-md font-bold text-primary-500">
                All Vouchers
            </label>
            <CompTabs tabsInfo={tabsInfo} className="mt-4" instance={instance} />
        </CompAccountsContainer>)
}