import clsx from 'clsx'
function TextInput({ className = '', size = 'small' }: TextInput) {
    const sizeLogic = { small: 'h-8', medium: 'h-10', large: 'h-12' }
    const internalClass = sizeLogic[size]
    return (<input type="text" className={clsx(className, internalClass, 'px-2 border-[1px]')} />)
}
export { TextInput }

type TextInput = {
    className?: string
    size?: 'small' | 'medium' | 'large'
}