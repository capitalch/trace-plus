import clsx from 'clsx'
function TextInput({ className = '', size = 'sm', type = 'text' }: TextInput) {
    const sizeLogic = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
    const internalClass = sizeLogic[size]
    return (<input type={type} className={clsx(className, internalClass, 'px-2 border-[1px]')} />)
}
export { TextInput }

type TextInput = {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    type?: 'text' | 'password'
}