import { IconRefresh } from "../icons/icon-refresh";

export function WidgetButtonRefresh({ handleRefresh }: WidgetButtonRefreshType) {
    return (
        <button type="button" className="flex px-2 bg-slate-50 rounded-xl hover:bg-slate-100" onClick={handleRefresh}>
            <IconRefresh className='w-10 h-10 text-primary-400 hover:text-primary-600' />
        </button>)
}

type WidgetButtonRefreshType = {
    handleRefresh: (args?: ArgsType) => void
}
type ArgsType = {
    [item: string]: string | undefined | any
}