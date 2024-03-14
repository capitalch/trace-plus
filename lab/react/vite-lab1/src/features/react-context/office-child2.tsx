import { useContext } from "react"
import { OfficeContext, OfficeContextType } from "./office-context"

export function OfficeChild2() {
    const officeContext: OfficeContextType = useContext(OfficeContext)
    return (<div>
        Office child2
        <button onClick={handleExecuteChildFunction}>Execute child function</button>
    </div>)

    function handleExecuteChildFunction() {
        officeContext.standardSelect.brandID()
    }
}