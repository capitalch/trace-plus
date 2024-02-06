import { createBrowserRouter } from "react-router-dom";
import { Protected } from "../../features/layouts/protected";
import { Layouts } from "../../features/layouts/layouts";
import { Blogs } from "../../features/blogs/blogs";
import { Login } from "../../features/login/login";
import { ErrorPage } from "./error-page";


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
            }
        ]
    },
    {
        path: '/login',
        element: <Login />,
        errorElement: <ErrorPage />,
    }
])


