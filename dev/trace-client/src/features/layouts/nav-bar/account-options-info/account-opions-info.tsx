

export function AccountOptionsInfo() {
    return (<div className="flex items-center ml-20">
        <button className="w-60 h-8 flex items-center px-2 py-2 text-gray-800 bg-gray-200 rounded-full shadow">
            {/* Badge section */}
            <div className="px-1 py-1 text-xs font-bold text-white bg-blue-500 rounded-full">
                BU
            </div>
            {/* Text section */}
            <span className="overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap">Business  unit 1</span>
        </button>
        {/* <span>Fy</span>
        <span>Branch</span> */}
    </div>)
}