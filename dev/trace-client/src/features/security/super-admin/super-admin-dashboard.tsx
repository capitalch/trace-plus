export function SuperAdminDashboard() {
    return (<div className="prose flex flex-col px-8 py-2">
        <h4 className="text-gray-500">Super Admin Dashboard</h4>
        <div className="flex mt-2 justify-between flex-wrap  gap-8">
            <div className="flex flex-col gap-2 w-60 h-40 bg-primary-100 text-black p-4 font-bold font-sans text-lg">
                <label className="">Database connections</label>
                <label className="font-normal text-sm">Active</label>
                <label className="font-normal text-sm">Idle</label>
                <label className="font-normal text-sm">Total</label>
            </div>

            <div className="flex flex-col gap-2 w-60 h-40 bg-primary-100 text-black p-4 font-bold font-sans text-lg">
                <label className="">Clients</label>
                <label className="font-normal text-sm">Active</label>
                <label className="font-normal text-sm">Idle</label>
                <label className="font-normal text-sm">Total</label>
            </div>

            <div className="flex flex-col gap-2 w-60 h-40 bg-primary-100 text-black p-4 font-bold font-sans text-lg">
                <label className="">Admin users</label>
                <label className="font-normal text-sm">Active</label>
                <label className="font-normal text-sm">Idle</label>
                <label className="font-normal text-sm">Total</label>
            </div>
        </div>
    </div>)
}