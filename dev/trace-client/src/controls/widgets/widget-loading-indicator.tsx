import { TwoSeventyRing } from 'react-svg-spinners'

export function WidgetLoadingIndicator({
    className
}: WidgetLoadingIndicatorType) {

    return (
        <div className={className || 'm-auto'}>
            <TwoSeventyRing color="#7c3aed" width={45} height={45} />
        </div>
    )
}

type WidgetLoadingIndicatorType = {
    className?: string
}