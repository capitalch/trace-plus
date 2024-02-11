import { MenuUnfoldIcon } from "../../../components/icons/menu-unfold-icon"

function TopNavBar() {

    return (
        // Top Nav bar
        <div className="flex items-center justify-between h-12 bg-primary-500 ">
            <div className="flex items-center prose text-white">
                <button className="mx-2">
                    <MenuUnfoldIcon className='h-6' />
                </button>
            </div>

        </div>)
}
export { TopNavBar }