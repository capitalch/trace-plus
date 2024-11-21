import { createBrowserRouter } from "react-router-dom";
import { Protected } from "../../features/layouts/protected";
import { Layouts } from "../../features/layouts/layouts";
import { Blogs } from "../../features/pages/blogs";
import { Login } from "../../features/login/login";
import { ErrorPage } from "./error-page";
import { Comp1 } from "../../features/pages/comp1";
import { SuperAdminDashboard } from "../../features/security/super-admin/dashboard/super-admin-dashboard";
import { SuperAdminClients } from "../../features/security/super-admin/clients/super-admin-clients";
import { SuperAdminRoles } from "../../features/security/super-admin/roles/super-admin-roles";
import { SuperAdminSecuredControls } from "../../features/security/super-admin/secured-controls/super-admin-secured-controls";
import { SuperAdminAdminUsers } from "../../features/security/super-admin/admin-users/super-admin-admin-users";
import { AdminDashBoard } from "../../features/security/admin/dashboard/admin-dashboard";
import { AdminBusinessUnits } from "../../features/security/admin/business-units/admin-business-units";
import { AdminRoles } from "../../features/security/admin/roles/admin-roles";
import { AdminBusinessUsers } from "../../features/security/admin/business users/admin-business-users";
import { AdminLinkUsersWithBu } from "../../features/security/admin/link-unlink-users/admin-link-users-with-bu";
import { SuperAdminLinkSecuredControlsWithRoles } from "../../features/security/super-admin/link-unlink-secured-controls/super-admin-link-secured-controls-with-roles";
import { AdminLinkSecuredControlsWithRoles } from "../../features/security/admin/link-unlink-secured-controls.tsx/admin-link-secured-controls-with-roles";

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <Protected>
            <Layouts />
        </Protected>,
        errorElement: <ErrorPage />,
        children:
            [
                { path: '/', element: <></> },
                { path: 'admin-business-units', element: <AdminBusinessUnits /> },
                { path: 'admin-business-users', element: <AdminBusinessUsers /> },
                { path: 'admin-dashboard', element: <AdminDashBoard /> },
                { path: 'admin-link-users', element: <AdminLinkUsersWithBu /> },
                { path: 'admin-link-secured-controls-roles', element: <AdminLinkSecuredControlsWithRoles />},
                { path: 'admin-roles', element: <AdminRoles /> },
                { path: 'blogs', element: <Blogs /> },
                { path: 'comp1', element: <Comp1 /> },
                { path: 'super-admin-admin-users', element: <SuperAdminAdminUsers /> },
                { path: 'super-admin-clients', element: <SuperAdminClients /> },
                { path: 'super-admin-dashboard', element: <SuperAdminDashboard /> },
                { path: 'super-admin-roles', element: <SuperAdminRoles /> },
                { path: 'super-admin-link-secured-controls-roles', element: <SuperAdminLinkSecuredControlsWithRoles /> },
                { path: 'super-admin-secured-controls', element: <SuperAdminSecuredControls /> }
            ]
    },
    {
        path: '/login',
        element: <Login />,
        errorElement: <ErrorPage />,
    }
], {
    //Following settings to escape warning
    future: {
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true
    },
})


