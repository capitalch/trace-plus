import clsx from 'clsx'
import { InputHTMLAttributes } from 'react'

export function WidgetTextInput(props: WidgetTextInputType) {
    const sizeLogic = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
    const internalClass = sizeLogic[props.size1]
    return (<input type={props.type} className={clsx(props.className, internalClass, 'px-2 border-[1px]')} {...props} />)
}

type WidgetTextInputType = {
    size1: 'sm' | 'md' | 'lg'
} & InputHTMLAttributes<HTMLInputElement>