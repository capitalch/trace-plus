import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { StockJournalCrown } from "./stock-journal-crown";
import { StockJournalMain } from "./stock-journal-main/stock-journal-main";

export function StockJournal() {
  const instance = DataInstancesMap.stockJournal
  return (<CompAccountsContainer>
    <div className="flex justify-between">
      <label className="mt-1 text-md font-bold text-primary-500">
        Stock Journal
      </label>
      <StockJournalCrown instance={instance} />
    </div>

    <StockJournalMain instance={instance} />
  </CompAccountsContainer>)
}