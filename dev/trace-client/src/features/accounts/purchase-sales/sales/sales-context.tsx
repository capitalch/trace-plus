import { createContext, useContext } from "react";
import { SalesLineItemType } from "./all-sales";
import { SalePurchaseEditDataType, TranDExtraType } from "../../../../utils/global-types-interfaces-enums";

const SalesContext = createContext<SalesContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSalesContext = (): SalesContextMethodsType => {
    const context = useContext(SalesContext);
    if (!context) {
        throw new Error('useSalesContext must be used within a SalesProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const useSalesContextOptional = (): SalesContextMethodsType | null => {
    return useContext(SalesContext);
};

export function SalesProvider({children, methods}: {children: React.ReactNode; methods: SalesContextMethodsType}) {
    return (
        <SalesContext.Provider value={methods}>
            {children}
        </SalesContext.Provider>
    );
}

export type SalesContextMethodsType = {
    resetAll: () => void;
    getDefaultSalesLineItem: () => SalesLineItemType;
    getDefaultDebitAccount: () => TranDExtraType;
    getDebitCreditDifference: () => number;
    populateFormOverId: (id: number) => Promise<void>;
    getSalesEditDataOnId: (id: number | undefined) => Promise<SalePurchaseEditDataType | null>;
};
