import { createContext, useContext } from "react";

const CreditNotesContext = createContext<CreditNotesContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCreditNotesContext = (): CreditNotesContextMethodsType => {
    const context = useContext(CreditNotesContext);
    if (!context) {
        throw new Error('useCreditNotesContext must be used within a CreditNotesProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const useCreditNotesContextOptional = (): CreditNotesContextMethodsType | null => {
    return useContext(CreditNotesContext);
};

export function CreditNotesProvider({children, methods}: {children: React.ReactNode; methods: CreditNotesContextMethodsType}) {
    return (
        <CreditNotesContext.Provider value={methods}>
            {children}
        </CreditNotesContext.Provider>
    );
}

export type CreditNotesContextMethodsType = {
    resetAll: () => void;
    computeGst: () => void;
    populateFormFromId: (id: number) => Promise<void>;
    getCreditNoteEditDataOnId: (id: number | undefined) => Promise<any>;
};
