import { AdminUsersIcon } from "../../../components/icons/admin-users-icon";
import { ClientsIcon } from "../../../components/icons/clients-icon";
import { DashboardIcon } from "../../../components/icons/dashboard-icon";
import { RolesIcon } from "../../../components/icons/roles-icon";
import { SecuredControlsIcon } from "../../../components/icons/secured-controls-icon";
import { NodeMenuItemType } from "./menu-items-type";

const superAdminMenuData: NodeMenuItemType[] = [
    {
        id:'1',
        label:'Dashboard',
        icon:DashboardIcon,
        children:[]
    },
    {
        id:'2',
        label:'Clients',
        icon:ClientsIcon,
        children:[],
        path:'purchase'
    },
    {
        id:'3',
        label:'Roles',
        icon:RolesIcon,
        children:[],
        path:'purchase'
    },
    {
        id:'4',
        label:'Secured controls',
        icon:SecuredControlsIcon,
        children:[],
        path:'purchase'
    },
    {
        id:'5',
        label:'Admin users',
        icon:AdminUsersIcon,
        children:[],
        path:'purchase'
    },
]

export{superAdminMenuData}