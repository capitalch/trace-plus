import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { ProductsOpeningBalancesWorkBench } from "./products-opening-balances-workbench";
import { ProductsOpeningBalancesGrid } from "./products-opening-balances-grid";

export function ProductsOpeningBalances() {

    return (<CompAccountsContainer>
        <div className="grid mt-4 mr-4 h-[calc(100vh-120px)] gap-2 grid-cols-1 sm:grid-cols-4">
            <div className="sm:col-span-1">
                <ProductsOpeningBalancesWorkBench />
            </div>
            <div className="sm:col-span-3">
                <ProductsOpeningBalancesGrid />
            </div>
        </div>

    </CompAccountsContainer>)

}