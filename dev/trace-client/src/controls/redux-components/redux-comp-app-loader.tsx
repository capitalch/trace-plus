import { WidgetLoadingIndicator } from "../widgets/widget-loading-indicator";

export function ReduxCompAppLoader() {
    return (<div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
        <WidgetLoadingIndicator />
    </div>)
}