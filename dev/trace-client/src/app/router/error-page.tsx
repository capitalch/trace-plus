import { useNavigate, useRouteError } from "react-router-dom"

function ErrorPage() {
    const error: any = useRouteError()
    const navigate = useNavigate()

    return (
        <div className="p-10 w-screen h-screen bg-slate-100">
            <div className="mx-auto mt-40 w-1/2 h-1/2 border-2 border-error-500">
                <h1 className="mt-4 text-4xl text-center text-error-500">Error!</h1>
                <p className="text-center text-error-500 text-lg">Sorry, an unexpected error has occurred.</p>
                <div className="text-center text-error-500 text-lg">
                    <div>{error?.statusText || error?.message || 'No message'}</div>
                </div>
                <p className="mt-10 text-center text-xl">
                    <button className="px-4 pt-1 pb-2 text-white bg-blue-500 rounded-md" onClick={handleLogin}> Login</button>
                </p>
            </div>
        </div>
    );

    function handleLogin(){
        navigate('/login');
    }
}
export { ErrorPage }
