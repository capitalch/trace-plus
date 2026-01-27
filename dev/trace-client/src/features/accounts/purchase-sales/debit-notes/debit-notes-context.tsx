import { createContext, useContext } from "react";

const DebitNotesContext = createContext<DebitNotesContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useDebitNotesContext = (): DebitNotesContextMethodsType => {
    const context = useContext(DebitNotesContext);
    if (!context) {
        throw new Error('useDebitNotesContext must be used within a DebitNotesProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const useDebitNotesContextOptional = (): DebitNotesContextMethodsType | null => {
    return useContext(DebitNotesContext);
};

export function DebitNotesProvider({children, methods}: {children: React.ReactNode; methods: DebitNotesContextMethodsType}) {
    return (
        <DebitNotesContext.Provider value={methods}>
            {children}
        </DebitNotesContext.Provider>
    );
}

export type DebitNotesContextMethodsType = {
    resetAll: () => void;
    computeGst: () => void;
    populateFormFromId: (id: number) => Promise<void>;
    getDebitNoteEditDataOnId: (id: number | undefined) => Promise<any>;
};
