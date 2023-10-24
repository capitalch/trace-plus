import { Route } from "react-router-dom"
import { Blogs } from "../features/blogs"
import { Home } from "../features/home"
import { Navigation } from "../features/navigation"

function useAppRoutes() {
    const routes: any[] = [
        {
            path: '/',
            component: Home
        },
        {
            path: 'navigation',
            component: Navigation
        },
        {
            path: 'blogs',
            component: Blogs
        }
    ]

    function getRoutes() {
        const rs = routes.map((r: any, index: number) => {
            return (
                <Route key={index} path={r.path} Component={r.component} />
            )
        })
        return (rs)
    }

    return ({ getRoutes, })
}
export { useAppRoutes }