import { Route } from "react-router-dom"
import { Blogs } from "../features/blogs"
import { Home } from "../features/home"
import { Common } from "../features/common"
import { Responsive } from "../features/responsive"
import { AppSignals } from "../features/app-signals"
import { AppMain } from "../features/app-main"
import { MyComp } from "../features/my-comp"
import { ReduxComponent } from "../features/redux-discrete/redux-component"

function useAppRoutes() {
    const routes: any[] = [
        {
            path: '/',
            component: Home
        },
        {
            path: 'common',
            component: Common
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
        },
        {
            path:'redux-counter',
            component: ReduxComponent
        }
    ]

    function getRoutes() {
        const rs: any = routes.map((r: any, index: number) => {
            if (r.path === 'app-main') {
                return (<Route key={index} path={r.path} Component={r.component}>
                    <Route key={index} path='my-comp' Component={MyComp} />
                </Route>)
            } else {
                return (
                    <Route key={index} path={r.path} Component={r.component} />
                )
            }

        })
        // rs[4]
        return (rs)
    }

    return ({ getRoutes, })
}
export { useAppRoutes }