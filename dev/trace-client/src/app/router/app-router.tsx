import { createBrowserRouter } from "react-router-dom";
import { Protected } from "../../features/layouts/protected";
import { Layouts } from "../../features/layouts/layouts";
import { Blogs } from "../../features/pages/blogs";
import { Login } from "../../features/login/login";
import { ErrorPage } from "./error-page";
import { Comp1 } from "../../features/pages/comp1";


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
            }
        ]
    },
    {
        path: '/login',
        element: <Login />,
        errorElement: <ErrorPage />,
    }
])


