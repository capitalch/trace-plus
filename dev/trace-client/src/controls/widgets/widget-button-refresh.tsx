import { IconIconRefresh } from "../icons/icon-icon-refresh";

export function WidgetButtonRefresh({ handleRefresh }: WidgetButtonRefreshType) {
    return (
        <button className="h-12 rounded-3xl bg-slate-100 hover:bg-slate-200 px-2" onClick={handleRefresh}>
            <IconIconRefresh className='h-10 w-10 text-primary-400 hover:text-primary-600' />
        </button>)
}

type WidgetButtonRefreshType = {
    handleRefresh: (args?: any) => void
}
// type ArgsType = {
//     [item: string]: string | undefined
// }cd 