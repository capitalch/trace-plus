import { useRouteError } from "react-router-dom"

function ErrorPage() {
    const error: any = useRouteError()
    
    return (<div id="error-page">
        <h1>Oops1!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <div>
            <div>{error?.statusText || error?.message || 'No message'}</div>
        </div>
    </div>
    );
}
export { ErrorPage }