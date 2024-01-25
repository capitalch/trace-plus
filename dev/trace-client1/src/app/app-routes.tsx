import { Route } from "react-router-dom"
import { Test } from "../features/login/test"
import { Purchase } from "../features/accounts/purchase/purchase"
import { Sales } from "../features/accounts/sales/sales"

function getAppRoutes() {
    let key = 0
    return ([
        <Route key={getKey()} path="test" element={<Test />} />,
        <Route key={getKey()} path='purchase' element={<Purchase />} />,
        <Route key={getKey()} path='sales' element={<Sales />} />
    ])

    function getKey() {
        return (key++)
    }
}
export { getAppRoutes }