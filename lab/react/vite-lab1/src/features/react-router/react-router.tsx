import {
    createBrowserRouter,
    // RouterProvider,
    // Route,
    // Link,
} from "react-router-dom";
import { Protected } from "./protected";
// import { Comp1 } from "./pages/comp1";
// import { Blogs } from "./pages/blogs";
// import { ErrorPage } from "./pages/error-page";
import { Layouts } from "../navigation/layouts/layouts";
import { Login } from "./login";
import { Blogs } from "./pages/blogs";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Protected>
            <Layouts />
        </Protected>,
        children: [
            {
                path:'blogs',
                element: <Blogs />
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    }
])
export { router }