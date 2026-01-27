import { createContext, useContext } from "react";
import { SalesReturnLineItemType } from "./all-sales-return";
import { SalePurchaseEditDataType, TranDType } from "../../../../utils/global-types-interfaces-enums";

const SalesReturnContext = createContext<SalesReturnContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSalesReturnContext = (): SalesReturnContextMethodsType => {
    const context = useContext(SalesReturnContext);
    if (!context) {
        throw new Error('useSalesReturnContext must be used within a SalesReturnProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const useSalesReturnContextOptional = (): SalesReturnContextMethodsType | null => {
    return useContext(SalesReturnContext);
};

export function SalesReturnProvider({children, methods}: {children: React.ReactNode; methods: SalesReturnContextMethodsType}) {
    return (
        <SalesReturnContext.Provider value={methods}>
            {children}
        </SalesReturnContext.Provider>
    );
}

export type SalesReturnContextMethodsType = {
    resetAll: () => void;
    getDefaultSalesReturnLineItem: () => SalesReturnLineItemType;
    getDefaultCreditAccount: () => TranDType;
    populateFormOverId: (id: number) => Promise<void>;
    getSalesReturnEditDataOnId: (id: number | undefined) => Promise<SalePurchaseEditDataType | null>;
};
