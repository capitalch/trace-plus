import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";

export function CommonUtilities(){
    return(<CompAccountsContainer>
        <label className="mt-3 text-lg font-medium text-primary-500">Common utilities</label>
        <div className="flex flex-col">
            <div className="flex mt-4 bg-slate-50 justify-between mr-6 py-2 px-4">
                <label className="text-primary-400 font-medium">Transfer closing balances from current financial year to next financial year</label>
                <button>Transfer</button>
            </div>
        </div>
    </CompAccountsContainer>)
}