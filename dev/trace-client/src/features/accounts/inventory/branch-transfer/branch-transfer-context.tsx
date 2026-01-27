import { createContext, useContext } from "react";

const BranchTransferContext = createContext<BranchTransferContextMethodsType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useBranchTransferContext = (): BranchTransferContextMethodsType => {
    const context = useContext(BranchTransferContext);
    if (!context) {
        throw new Error('useBranchTransferContext must be used within a BranchTransferProvider');
    }
    return context;
};

// Optional version that returns null if not within provider (for shared components)
// eslint-disable-next-line react-refresh/only-export-components
export const useBranchTransferContextOptional = (): BranchTransferContextMethodsType | null => {
    return useContext(BranchTransferContext);
};

export function BranchTransferProvider({children, methods}: {children: React.ReactNode; methods: BranchTransferContextMethodsType}) {
    return (
        <BranchTransferContext.Provider value={methods}>
            {children}
        </BranchTransferContext.Provider>
    );
}

export type BranchTransferContextMethodsType = {
    xReset: () => void;
};
