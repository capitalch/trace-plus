import { useEffect } from "react"
import { OfficeChild11 } from "./office-child11"
// import { OfficeContext, OfficeContextType } from "./office-context"

export function OfficeChild1() {
    // const officeContext: OfficeContextType = useContext(OfficeContext)

    useEffect(() => {
        
    }, [])

    return (<div>
        Office child1
        <OfficeChild11 />
    </div>)
}