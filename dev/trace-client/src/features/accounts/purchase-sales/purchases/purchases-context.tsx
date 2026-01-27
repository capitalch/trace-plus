import { createContext, useContext } from "react";
import { PurchaseLineItemType } from "./all-purchases/all-purchases";
import { SalePurchaseEditDataType } from "../../../../utils/global-types-interfaces-enums";

const PurchasesContext = createContext<PurchasesContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const usePurchasesContext = (): PurchasesContextMethodsType => {
    const context = useContext(PurchasesContext);
    if (!context) {
        throw new Error('usePurchasesContext must be used within a PurchasesProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const usePurchasesContextOptional = (): PurchasesContextMethodsType | null => {
    return useContext(PurchasesContext);
};

export function PurchasesProvider({children, methods}: {children: React.ReactNode; methods: PurchasesContextMethodsType}) {
    return (
        <PurchasesContext.Provider value={methods}>
            {children}
        </PurchasesContext.Provider>
    );
}

export type PurchasesContextMethodsType = {
    resetAll: () => void;
    getDefaultPurchaseLineItem: () => PurchaseLineItemType;
    checkPurchaseInvoiceExists: () => Promise<boolean>;
    populateFormFromId: (id: number) => Promise<void>;
    getPurchaseEditDataOnId: (id: number | undefined) => Promise<SalePurchaseEditDataType | null>;
};
