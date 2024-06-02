import { ContentContainer } from "../../../../components/widgets/content-container"
import { LoadingIndicator } from "../../../../components/widgets/loading-indicator"
import { SuperAdminDashBoardType, useSuperAdminDashBoard } from "./super-admin-dashboard-hook"

export function SuperAdminDashboard() {
    const { loading, refetch, superAdminDashBoard }: { loading: boolean, refetch: any, superAdminDashBoard: SuperAdminDashBoardType } = useSuperAdminDashBoard()
    if (loading) {
        return (<LoadingIndicator />)
    }

    return (
        <ContentContainer title='Super admin dashboard' className="">
            <div className="flex flex-wrap gap-8">
                
                {/* Database connections */}
                <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm text-black">
                    <label className="text-lg font-bold">Database connections</label>
                    <span className="flex justify-between">
                        <label className="">Active</label>
                        <label>{superAdminDashBoard.dbConnections.active}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Idle</label>
                        <label>{superAdminDashBoard.dbConnections.idle}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Total</label>
                        <label>{superAdminDashBoard.dbConnections.total}</label>
                    </span>
                </div>

                {/* Clients */}
                <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm text-black">
                    <label className="text-lg font-bold">Clients</label>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Active</label>
                        <label>{superAdminDashBoard.clients.active}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Inactive</label>
                        <label>{superAdminDashBoard.clients.inactive}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Total</label>
                        <label>{superAdminDashBoard.clients.total}</label>
                    </span>
                </div>

                {/* Admin users */}
                <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm text-black">
                    <label className="text-lg font-bold">Admin users</label>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Active</label>
                        <label>{superAdminDashBoard.adminUsers.active}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Inactive</label>
                        <label>{superAdminDashBoard.adminUsers.inactive}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Total</label>
                        <label>{superAdminDashBoard.adminUsers.total}</label>
                    </span>
                </div>

                {/*Non  Admin users */}
                <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm text-black">
                    <label className="text-lg font-bold">Non admin users</label>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Active</label>
                        <label>{superAdminDashBoard.nonAdminUsers.active}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Inactive</label>
                        <label>{superAdminDashBoard.nonAdminUsers.inactive}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Total</label>
                        <label>{superAdminDashBoard.nonAdminUsers.total}</label>
                    </span>
                </div>

                {/* Roles */}
                <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm text-black">
                    <label className="text-lg font-bold">Roles</label>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Super admin</label>
                        <label>{superAdminDashBoard.roles.superAdmin}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Admin</label>
                        <label>{superAdminDashBoard.roles.admin}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Total</label>
                        <label>{superAdminDashBoard.roles.total}</label>
                    </span>
                </div>

                {/* Misc */}
                <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm text-black">
                    <label className="text-lg font-bold">Misc</label>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Databases</label>
                        <label>{superAdminDashBoard.misc.databasesCount}</label>
                    </span>
                    <span className="flex justify-between">
                        <label className="text-sm font-normal">Secured controls</label>
                        <label>{superAdminDashBoard.misc.securedControlsCount}</label>
                    </span>
                </div>

                <div>
                    <button className="rounded-md bg-slate-200 px-2" onClick={() => {
                        refetch()
                    }}>Re fetch</button>
                </div>
            </div>
        </ContentContainer>

    )
}