export function AppGridSearchBox(){
    return(
        <div className="flex">
            <input type="text" placeholder="Search" className="border-2 border-gray-300 rounded-lg w-1/2" />
            <button className="bg-primary-500 text-white rounded-lg px-2 ml-2">Search</button>
        </div>
    )
}