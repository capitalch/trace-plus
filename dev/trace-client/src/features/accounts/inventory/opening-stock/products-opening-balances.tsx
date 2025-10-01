import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import { ProductsOpeningBalancesWorkBench } from "./products-opening-balances-workbench";
import { ProductsOpeningBalancesGrid } from "./products-opening-balances-grid";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store";
import { setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import { useEffect } from "react";

export function ProductsOpeningBalances() {
    const dispatch: AppDispatchType = useDispatch();

    // Set main title for Opening Stock
    useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Opening Stock" }));
    }, [dispatch]);

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