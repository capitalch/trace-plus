import { WidgetLoadingIndicator } from "../widgets/widget-loading-indicator";

export function CompAppLoader() {
    return (<div className="flex fixed items-center justify-center outline-hidden focus:outline-hidden inset-0 overflow-x-hidden overflow-y-auto z-9999">
        <WidgetLoadingIndicator />
    </div>)
}