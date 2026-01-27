import { createContext, useContext } from "react";

const VouchersContext = createContext<VouchersContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useVouchersContext = (): VouchersContextMethodsType => {
    const context = useContext(VouchersContext);
    if (!context) {
        throw new Error('useVouchersContext must be used within a VouchersProvider');
    }
    return context;
};

export function VouchersProvider({children, methods}: {children: React.ReactNode; methods: VouchersContextMethodsType}) {
    return (
        <VouchersContext.Provider value={methods}>
            {children}
        </VouchersContext.Provider>
    );
}

export type VouchersContextMethodsType = {
    resetAll: () => void;
    getVoucherDetailsOnId: (id: number | undefined) => Promise<any>;
    populateFormFromId: (id: number) => Promise<void>;
};
