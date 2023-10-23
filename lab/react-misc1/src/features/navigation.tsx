import { Button } from "../components/controls/buttons"

function Navigation() {
    return (<div className="flex flex-col w-1/5 gap-2">
        <Button />
        <input type="text" className="h-8 px-2 py-3 border border-zinc-300"  />
        <div className="prose prose-slate prose-h4:text-red-600">
        <h4 className="ml-2">Header</h4>
        </div>
        {/* <select className="w-10"></select> */}
    </div>)
}
export { Navigation }