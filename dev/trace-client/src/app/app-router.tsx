import { createBrowserRouter } from "react-router-dom";
import { Protected } from "../features/layouts/protected";
import { Layouts } from "../features/layouts/layouts";
import { Blogs } from "../features/blogs/blogs";
import { Login } from "../features/login/login";


export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <Protected>
            <Layouts />
        </Protected>,
        children: [
            {
                path: 'blogs',
                element: <Blogs />
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    }
])


