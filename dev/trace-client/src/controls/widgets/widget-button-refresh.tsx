import { IconRefresh } from "../icons/icon-refresh";

export function WidgetButtonRefresh({ handleRefresh }: WidgetButtonRefreshType) {
    return (
        <button type="button" className="rounded-xl bg-slate-50 hover:bg-slate-100 px-2 flex" onClick={handleRefresh}>
            <IconRefresh className='h-10 w-10 text-primary-400 hover:text-primary-600' />
        </button>)
}

type WidgetButtonRefreshType = {
    handleRefresh: (args?: ArgsType) => void
}
type ArgsType = {
    [item: string]: string | undefined | any
}