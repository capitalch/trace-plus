import { ClipLoader } from 'react-spinners';
export function Spinners() {
    return (<div className="flex flex-col gap-4">
        {/* Tailwind spinner */}
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <ClipLoader color='#4A90E2' size={40} />
    </div>)
}