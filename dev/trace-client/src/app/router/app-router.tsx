import { createBrowserRouter } from "react-router-dom";
import { Protected } from "../../features/layouts/protected";
import { Layouts } from "../../features/layouts/layouts";
import { Blogs } from "../../features/pages/blogs";
import { Login } from "../../features/login/login";
import { ErrorPage } from "./error-page";
import { Comp1 } from "../../features/pages/comp1";
import { SuperAdminDashboard } from "../../features/security/super-admin/dashboard/super-admin-dashboard";
import { SuperAdminClients } from "../../features/security/super-admin/clients/super-admin-clients";

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <Protected>
            <Layouts />
        </Protected>,
        errorElement: <ErrorPage />,
        children: [
            {
                path: 'blogs',
                element: <Blogs />
            },
            {
                path: 'comp1',
                element: <Comp1 />
            },
            {
                path: 'super-admin-dashboard',
                element: <SuperAdminDashboard />
            },
            {
                path: 'super-admin-clients',
                element: <SuperAdminClients />
            }
            // {
            //     path: 'change-uid',
            //     element: <ChangeUid />
            // }
        ]
    },
    {
        path: '/login',
        element: <Login />,
        errorElement: <ErrorPage />,
    }
])


