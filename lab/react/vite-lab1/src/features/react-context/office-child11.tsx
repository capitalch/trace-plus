import { useContext, useEffect } from "react"
import { OfficeContext, OfficeContextType } from "./office-context"

export function OfficeChild11() {
    const officeContext: OfficeContextType = useContext(OfficeContext)
    useEffect(() => {
        const { brandID } = officeContext.standardSelect;
        brandID();
    }, [officeContext?.standardSelect]);
    return (<div>
        Office Child11
    </div>)

}