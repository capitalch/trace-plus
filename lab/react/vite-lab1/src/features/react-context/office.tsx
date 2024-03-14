// import { useContext } from "react";
import { OfficeChild1 } from "./office-child1";
import { OfficeContext, OfficeContextType, } from "./office-context";
import { OfficeChild2 } from "./office-child2";
import { useContext } from "react";

export function Office() {
    const officeContext: OfficeContextType = useContext(OfficeContext)
    return (
        // <OfficeContext.Provider value={{ standardSelect: { brandID: () => { } } }} >
        <div className="m-2">
            Office
            <OfficeChild1 />

            <OfficeChild2 />
            <button onClick={handleExecuteChildFunction}>Execute child11 function</button>
        </div>
        // </OfficeContext.Provider>
    )

    function handleExecuteChildFunction() {
        officeContext.standardSelect.brandID()
    }

}