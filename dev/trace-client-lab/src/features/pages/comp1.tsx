import { useEffect } from "react"

function Comp1() {
    useEffect(() => {
        throw new Error("This is custom error")
    }, [])
    return (<div>This is comp1</div>)
}

export { Comp1 }