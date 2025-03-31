import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { StockJournalMain } from "./stock-journal-main/stock-journal-main";

export function StockJournal() {
  const instance = DataInstancesMap.stockJournal
  return (<CompAccountsContainer>
    <label className="mt-1 text-md font-bold text-primary-500">
      Stock Journal
    </label>
    <StockJournalMain instance={instance} />
  </CompAccountsContainer>)
}