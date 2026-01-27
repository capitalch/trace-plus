import { createContext, useContext } from "react";
import { PurchaseLineItemType } from "../purchases/all-purchases/all-purchases";
import { SalePurchaseEditDataType } from "../../../../utils/global-types-interfaces-enums";

const PurchaseReturnsContext = createContext<PurchaseReturnsContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const usePurchaseReturnsContext = (): PurchaseReturnsContextMethodsType => {
    const context = useContext(PurchaseReturnsContext);
    if (!context) {
        throw new Error('usePurchaseReturnsContext must be used within a PurchaseReturnsProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const usePurchaseReturnsContextOptional = (): PurchaseReturnsContextMethodsType | null => {
    return useContext(PurchaseReturnsContext);
};

export function PurchaseReturnsProvider({children, methods}: {children: React.ReactNode; methods: PurchaseReturnsContextMethodsType}) {
    return (
        <PurchaseReturnsContext.Provider value={methods}>
            {children}
        </PurchaseReturnsContext.Provider>
    );
}

export type PurchaseReturnsContextMethodsType = {
    resetAll: () => void;
    getDefaultPurchaseLineItem: () => PurchaseLineItemType;
    populateFormFromId: (id: number) => Promise<void>;
    getPurchaseReturnEditDataOnId: (id: number | undefined) => Promise<SalePurchaseEditDataType | null>;
};
