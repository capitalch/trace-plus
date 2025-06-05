import { useNavigate, useRouteError } from "react-router-dom"

function ErrorPage() {
    const error: any = useRouteError()
    const navigate = useNavigate()

    return (
        <div className="h-screen w-screen bg-slate-100 p-10">
            <div className="mx-auto mt-40 h-1/2 w-1/2 border-2 border-error-500">
                <h1 className="text-center mt-4 text-4xl text-error-500">Error!</h1>
                <p className="text-center text-lg text-error-500">Sorry, an unexpected error has occurred.</p>
                <div className="text-center text-lg text-error-500">
                    <div>{error?.statusText || error?.message || 'No message'}</div>
                </div>
                <p className="text-center mt-10 text-xl">
                    <button className="bg-blue-500 text-white px-4 pt-1 pb-2 rounded-md" onClick={handleLogin}> Login</button>
                </p>
            </div>
        </div>
    );

    function handleLogin(){
        navigate('/login');
    }
}
export { ErrorPage }
