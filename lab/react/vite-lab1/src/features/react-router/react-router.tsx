import {
    createBrowserRouter,
    // RouterProvider,
    // Route,
    // Link,
  } from "react-router-dom";
import { Comp1 } from "./pages/comp1";
import { Blogs } from "./pages/blogs";
import { ErrorPage } from "./pages/error-page";

const router = createBrowserRouter([
    {
        path:'/',
        element:<Comp1 />
        , errorElement:<ErrorPage />
    },
    {
        path:'/blogs',
        element:<Blogs />
        
    }
])
export {router}