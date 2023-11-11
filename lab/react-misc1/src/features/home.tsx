import { useNavigate } from "react-router-dom"

function Home() {
    const navigate = useNavigate()
    return (<div className="m-10 prose">
        <h1> This is home</h1>
        <div className="flex gap-2 w-max">
            <button onClick={handleOnClickCommon} className="px-3 rounded-md bg-orange-600 bg-gradient-to-r">Common</button>
            <button onClick={handleOnClickBlogs} className="px-3 bg-orange-500 rounded-md"> Blogs</button>
            <button onClick={handleOnClickResponsive} className="px-3 rounded-md bg-slate-400"> Responsive</button>
            <button onClick={handleOnClickAppMain} className="px-3 rounded-md bg-zinc-400"> App main</button>
            <button onClick={handleOnClickSignals} className="px-3 rounded-md bg-zinc-400"> Signals</button>
            <button className="px-2 py-1 rounded-md bg-slate-200" onClick={()=>navigate('redux-counter')}>Redux counter</button>
        </div>
    </div>)

    function handleOnClickCommon() {
        navigate('common')
    }

    function handleOnClickBlogs() {
        navigate('blogs')
    }

    function handleOnClickResponsive() {
        navigate('responsive')
    }

    function handleOnClickAppMain() {
        navigate('app-main/my-comp')
    }

    function handleOnClickSignals() {
        navigate('signals')
    }
}
export { Home }