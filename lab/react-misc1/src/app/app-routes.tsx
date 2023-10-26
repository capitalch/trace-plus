import { Route } from "react-router-dom"
import { Blogs } from "../features/blogs"
import { Home } from "../features/home"
import { Navigation } from "../features/navigation"
import { Responsive } from "../features/responsive"
import { Layout } from "../features/layout"
import { AppSignals } from "../features/app-signals"
import { AppMain } from "../features/app-main"

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
        },
        {
            path: 'responsive',
            component: Responsive
        },
        {
            path: 'app-main',
            component: AppMain
        },
        {
            path: 'signals',
            component: AppSignals
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