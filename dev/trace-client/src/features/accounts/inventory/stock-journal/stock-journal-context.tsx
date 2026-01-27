import { createContext, useContext } from "react";

const StockJournalContext = createContext<StockJournalContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useStockJournalContext = (): StockJournalContextMethodsType => {
    const context = useContext(StockJournalContext);
    if (!context) {
        throw new Error('useStockJournalContext must be used within a StockJournalProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const useStockJournalContextOptional = (): StockJournalContextMethodsType | null => {
    return useContext(StockJournalContext);
};

export function StockJournalProvider({children, methods}: {children: React.ReactNode; methods: StockJournalContextMethodsType}) {
    return (
        <StockJournalContext.Provider value={methods}>
            {children}
        </StockJournalContext.Provider>
    );
}

export type StockJournalContextMethodsType = {
    xReset: () => void;
};
