import { useNavigate } from "react-router-dom"

function Home() {
    const navigate = useNavigate()
    return (<div className="m-10 prose">
        <h1> This is home</h1>
        <div className="flex gap-2">
            <button onClick={handleOnClickNav} className="px-3 rounded-md bg-slate-300">Navigate</button>
            <button onClick={handleOnClickBlogs} className="px-3 bg-orange-500 rounded-md"> Blogs</button>
            <button onClick={handleOnClickResponsive} className="px-3 rounded-md bg-slate-400"> Responsive</button>
            <button onClick={handleOnClickAppMain} className="px-3 rounded-md bg-zinc-400"> App main</button>
            <button onClick={handleOnClickSignals} className="px-3 rounded-md bg-zinc-400"> Signals</button>
        </div>
    </div>)

    function handleOnClickNav() {
        navigate('navigation')
    }

    function handleOnClickBlogs() {
        navigate('blogs')
    }

    function handleOnClickResponsive() {
        navigate('responsive')
    }

    function handleOnClickAppMain() {
        navigate('app-main')
    }

    function handleOnClickSignals() {
        navigate('signals')
    }
}
export { Home }