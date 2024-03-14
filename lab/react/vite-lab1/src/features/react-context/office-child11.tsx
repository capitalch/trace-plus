import { useContext, useEffect } from "react"
import { OfficeContext, OfficeContextType } from "./office-context"

export function OfficeChild11() {
    const officeContext: OfficeContextType = useContext(OfficeContext)
    useEffect(() => {
        officeContext.standardSelect.brandID = (() => {
            console.log('brandID')
        })
    }, [])
    return (<div>
        Office Child11
    </div>)

}