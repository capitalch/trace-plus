import { IconMinusCircle } from "../../../../controls/icons/icon-minus-circle";
import { IconPlusCircle } from "../../../../controls/icons/icon-plus-circle";


export function AccountOptionsInfo() {
    return (
        <div className="ml-8 flex items-center bg-gray-500 rounded-full px-2 py-2">
            {/* Business unit */}
            <button className="flex h-8 w-60 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">
                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    BU
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">Business  unit 1</span>
            </button>

            {/* financial year */}
            <div className="ml-4 flex items-center">
                {/* Plus */}
                <button>
                    <IconPlusCircle className="h-7 w-7" />
                </button>
                {/* Financial year */}
                <button className="w-70 ml-1 flex h-8 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">
                    {/* Badge section */}
                    <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                        FY
                    </div>
                    {/* Text section */}
                    <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">2024 (01/04/2024 - 31/03/2025)</span>
                </button>
                {/* minus */}
                <button className="ml-1">
                    <IconMinusCircle className="h-7 w-7" />
                </button>
            </div>

            {/* Branch */}
            <button className="w-70 ml-4 flex h-8 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">
                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    BR
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">Head office</span>
            </button>
        </div>)
}