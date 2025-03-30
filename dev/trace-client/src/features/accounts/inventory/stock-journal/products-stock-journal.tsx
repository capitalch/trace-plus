import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";

export function ProductsStockJournal(){
    return(<CompAccountsContainer>
          <label className="mt-1 text-md font-medium text-primary-500">
            Stock Journal
          </label>
          {/* <CompTabs tabsInfo={tabsInfo} className="mt-4" instance={instance} /> */}
        </CompAccountsContainer>)
}