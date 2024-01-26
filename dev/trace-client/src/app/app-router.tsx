import { createBrowserRouter } from "react-router-dom";
import { Protected } from "../components/controls/protected/protected";
import { Layouts } from "../components/controls/layouts/layouts";
import { Blogs } from "../features/blogs/blogs";
import { Login } from "../components/controls/login/login";


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


