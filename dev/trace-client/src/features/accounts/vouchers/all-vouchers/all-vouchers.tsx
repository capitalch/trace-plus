import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { AllVouchersMain } from "./all-vouchers-main";
import { VoucherTypeOptions } from "./voucher-type-options";

export function AllVouchers() {
    const instance = DataInstancesMap.allVouchers;
    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllVouchersMain />
        },
        {
            label: "View",
            content: <></>
        }
    ];
    return (
        <CompAccountsContainer className="relative">
            <label className="mt-1 text-md font-bold text-primary-500">
                All Vouchers
            </label>
            {/* <div className="sticky top-39 right-6 z-30 bg-white">
                <VoucherTypeOptions />
            </div>
            <div className="overflow-auto max-h-[80vh]">
                <CompTabs tabsInfo={tabsInfo} instance={instance} />
            </div> */}
            <div className="sticky top-16 z-30">
                <VoucherTypeOptions className="bg-white shadow-md rounded" />
            </div>
            <CompTabs tabsInfo={tabsInfo} className="mt-3" instance={instance} />
        </CompAccountsContainer>
    )
}