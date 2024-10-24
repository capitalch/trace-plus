export function WidgetSwitch({
    leftLabel = ''
    , onChange
    , rightLabel = ''
}: WidgetSwitchType) {
    return (
        <label className="inline-flex cursor-pointer items-center">
            <span className="mr-2 text-sm font-medium text-gray-500">{leftLabel}</span>
            <input type="checkbox" value="" className="peer sr-only" onChange={onChange} />
            <div className="peer relative h-6 w-11 rounded-full hover:bg-slate-500 bg-primary-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:peer-focus:ring-blue-800"></div>
            <span className="ml-2 text-sm font-medium text-gray-600">{rightLabel}</span>
        </label>
    )
}

type WidgetSwitchType = {
    leftLabel?: string
    onChange?: (e: any) => void
    rightLabel?: string
}