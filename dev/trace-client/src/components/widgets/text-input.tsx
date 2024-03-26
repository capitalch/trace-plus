import clsx from 'clsx'
import { HTMLAttributes, HTMLProps, InputHTMLAttributes } from 'react'
export function TextInput({ className = '', size = 'sm', type = 'text',props }: TextInput) {
    const sizeLogic = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
    const internalClass = sizeLogic[size]
    return (<input type={type} className={clsx(className, internalClass, 'px-2 border-[1px]')} />)
}

export function TextInput1(props:TextInput1Type ) {
    const sizeLogic: any = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
    console.log(props.size1)
    const internalClass = '' // sizeLogic[size || 'h-8']
    return (<input type={props.type} className={clsx(props?.className, internalClass, 'px-2 border-[1px]')} {...props} />)
}

type TextInput = {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    type?: 'text' | 'password'
    props?: InputHTMLAttributes<HTMLInputElement>
}

type TextInput1Type = {
    size: 'sm' | 'md' | 'lg'
} & InputHTMLAttributes<HTMLInputElement>