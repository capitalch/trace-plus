import {
    createBrowserRouter,
    // RouterProvider,
    // Route,
    // Link,
  } from "react-router-dom";
// import { Comp1 } from "./pages/comp1";
import { Blogs } from "./pages/blogs";
import { ErrorPage } from "./pages/error-page";
import { Layouts } from "../navigation/layouts/layouts";

const router = createBrowserRouter([
    {
        path:'/',
        element:<Layouts/>
        , errorElement:<ErrorPage />
    },
    {
        path:'/blogs',
        element:<Blogs />
        
    }
])
export {router}