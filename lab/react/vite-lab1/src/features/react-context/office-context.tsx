import { createContext } from "react"

export type OfficeContextType = {
    standardSelect: {
        brandID: (() => void)
    }
}

export const OfficeContext = createContext<OfficeContextType>({ standardSelect: { brandID: () => { } } })