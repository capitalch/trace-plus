import clsx from "clsx";
import { InputHTMLAttributes, } from "react";

export function ReactPassHtmlPtops() {
    return (<div>
        <TextInput size1="sm" value={'Sushant'} className="bg-slate-100" style={{color:'red'}} />
    </div>)
}

export function TextInput({ ...props }: TextInputType) {
    console.log(props.size1)
    return (<input type='text' value={props.value} className={clsx(props.className, 'px-2 border-[1px]')} {...props} />)
}

type TextInputType = {
    size1: 'sm' | 'md' | 'lg'
} & InputHTMLAttributes<HTMLInputElement>