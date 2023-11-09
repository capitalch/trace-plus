import { BusinessUnitsIcon } from "../../../components/icons/business-units-icon";
import { DashboardIcon } from "../../../components/icons/dashboard-icon";
import { RolesIcon } from "../../../components/icons/roles-icon";
import { NodeMenuItemType } from "./menu-items-type";
import { UsersIcon } from "./users-icon";

const adminMenuData: NodeMenuItemType[] = [
    {
        id:'1',
        label:'Dashboard',
        icon:DashboardIcon,
        children:[]
    },
    {
        id:'2',
        label:'Business units',
        icon:BusinessUnitsIcon,
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
        label:'Business users',
        icon:UsersIcon,
        children:[],
        path:'purchase'
    },
]

export {adminMenuData}