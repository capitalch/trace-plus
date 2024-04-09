export function SuperAdminDashboard() {
    const dbConnActive = 10, dbConnIdle = 5, dbConnTotal = 15

    return (<div id='super-admin-top' className="flex flex-col px-8">
        <h4 className="text-gray-500">Super Admin Dashboard</h4>
        <div className="mt-4 flex flex-wrap gap-8">
            <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm   text-black">
                <label className="text-lg font-bold">Database connections</label>
                <span className="flex justify-between">
                    <label className="">Active</label>
                    <label>{dbConnActive}</label>
                </span>
                <span className="flex justify-between">
                    <label className="text-sm font-normal">Idle</label>
                    <label>{dbConnIdle}</label>
                </span>
                <span className="flex justify-between">
                    <label className="text-sm font-normal">Total</label>
                    <label>{dbConnTotal}</label>
                </span>
            </div>

            <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-lg font-bold text-black">
                <label className="">Clients</label>
                <label className="text-sm font-normal">Active</label>
                <label className="text-sm font-normal">Idle</label>
                <label className="text-sm font-normal">Total</label>
            </div>

            <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-lg font-bold text-black">
                <label className="">Admin users</label>
                <label className="text-sm font-normal">Active</label>
                <label className="text-sm font-normal">Idle</label>
                <label className="text-sm font-normal">Total</label>
            </div>
        </div>
    </div>)
}