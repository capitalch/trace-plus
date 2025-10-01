import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import { StockJournalMain } from "./stock-journal-main/stock-journal-main";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store";
import { setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import { useEffect } from "react";

export function StockJournal() {
  const instance = DataInstancesMap.stockJournal;
  const dispatch: AppDispatchType = useDispatch();

  // Set main title for Stock Journal
  useEffect(() => {
    dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Stock Journal" }));
  }, [dispatch]);

  return (<CompAccountsContainer>
    <StockJournalMain instance={instance} />
  </CompAccountsContainer>)
}