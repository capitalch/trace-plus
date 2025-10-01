import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import {
  CompTabs,
  CompTabsType
} from "../../../../controls/redux-components/comp-tabs";
import { ProductsBranchTransferMain } from "./products-branch-transfer-main/products-branch-transfer-main";
import { ProductsBranchTransferView } from "./products-branch-transfer-view";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import { useEffect } from "react";

export function ProductsBranchTransfers() {
  const instance = DataInstancesMap.productsBranchTransfer;
  const dispatch: AppDispatchType = useDispatch();
  const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[instance]?.activeTabIndex || 0);

  const getBranchTransferTitle = (isViewMode: boolean): string => {
    return isViewMode ? "Branch Transfer View" : "Branch Transfer";
  };

  // Set main title for Branch Transfer
  useEffect(() => {
    const isViewMode = activeTabIndex === 1;
    const title = getBranchTransferTitle(isViewMode);
    dispatch(setCompAccountsContainerMainTitle({ mainTitle: title }));
  }, [activeTabIndex, dispatch]);

  const tabsInfo: CompTabsType = [
    {
      label: "Main",
      content: <ProductsBranchTransferMain instance={instance} />
    },
    {
      label: "View",
      content: <ProductsBranchTransferView instance = {instance} />
    }
  ];
  return (
    <CompAccountsContainer>
      <CompTabs tabsInfo={tabsInfo} className="mt-4" instance={instance} />
    </CompAccountsContainer>
  );
}
