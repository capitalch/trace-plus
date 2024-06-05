import { IconIconRefresh } from "../icons/icon-icon-refresh";

export function WidgetButtonRefresh({ handleRefresh }: WidgetButtonRefreshType) {
    return (
        <button className="h-12 rounded-3xl bg-primary-400 px-2 hover:bg-primary-600" onClick={handleRefresh}>
            <IconIconRefresh className='h-9 w-9 text-gray-300 hover:text-white' />
        </button>)
}

type WidgetButtonRefreshType = {
    handleRefresh: (args?: any) => void
}
// type ArgsType = {
//     [item: string]: string | undefined
// }