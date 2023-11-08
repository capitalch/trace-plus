import { FinalAccountsIcon } from "../../../components/icons/final-accounts-icon"
import { InventoryIcon } from "../../../components/icons/inventory-icon"
import { MastersIcon } from "../../../components/icons/masters-icon"
import { OptionsIcon } from "../../../components/icons/options-icon"
import { PurchaseSalesIcon } from "../../../components/icons/purchase-sales-icon"
import { ReportsIcon } from "../../../components/icons/reports-icon"
import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { NodeMenuItemType } from "./menu-items-type"

const accountsMenuData: NodeMenuItemType[] = [
    {
        id: '1',
        title: 'Vouchers',
        icon: VoucherIcon,
        children: [
            {
                id: '11',
                title: 'Journals',
                path: 'purchase'
            },
            {
                id: '12',
                title: 'Payments',
                path: 'purchase'
            },
            {
                id: '13',
                title: 'Receipts',
                path: 'purchase'
            },
            {
                id: '14',
                title: 'Contra',
                path: 'purchase'
            },
        ]
    },
    {
        id: '2',
        title: 'Purch / Sales',
        icon: PurchaseSalesIcon,
        children: [
            {
                id: '21',
                title: 'Purchase',
                path: 'purchase'
            },
            {
                id: '22',
                title: 'Purchase returns',
                path: 'purchase'
            },
            {
                id: '23',
                title: 'Sales',
                path: 'sales'
            },
            {
                id: '24',
                title: 'Sales returns',
                path: 'purchase'
            },
            {
                id: '25',
                title: 'Debit notes',
                path: 'purchase'
            },
            {
                id: '26',
                title: 'Credit notes',
                path: 'purchase'
            }
        ]
    },
    {
        id: '3',
        title: 'Masters',
        icon: MastersIcon,
        children: [
            {
                id: '31',
                title: 'Company info',
                path: 'purchase'
            },
            {
                id: '32',
                title: 'General settings',
                path: 'purchase'
            },
            {
                id: '33',
                title: 'Accounts',
                path: 'purchase'
            },
            {
                id: '34',
                title: 'Opening balances',
                path: 'purchase'
            },
            {
                id: '35',
                title: 'Branches',
                path: 'purchase'
            },
            {
                id: '36',
                title: 'Financial years',
                path: 'purchase'
            },
        ]
    },
    {
        id: '4',
        title: 'Final accounts',
        icon: FinalAccountsIcon,
        children: [
            {
                id: '41',
                title: 'Trial balance',
                path: 'purchase'
            },
            {
                id: '42',
                title: 'Balance sheet',
                path: 'purchase'
            },
            {
                id: '43',
                title: 'PL account',
                path: 'purchase'
            },
            {
                id: '44',
                title: 'General ledger',
                path: 'purchase'
            },
        ]
    },
    {
        id: '5',
        title: 'Options',
        icon: OptionsIcon,
        children: [
            {
                id: '51',
                title: 'Bank recon',
                path: 'purchase'
            },
            {
                id: '52',
                title: 'Common utilities',
                path: 'purchase'
            },
            {
                id: '53',
                title: 'Exports',
                path: 'purchase'
            },
        ]
    },
    {
        id: '6',
        title: 'Reports',
        icon: ReportsIcon,
        children: [
            {
                id: '61',
                title: 'All transactions',
                path: 'purchase'
            },
        ]
    },
    {
        id: '7',
        title: 'Inventory',
        icon: InventoryIcon,
        children: [
            {
                id: '71',
                title: 'Categories',
                path: 'purchase'
            },
            {
                id: '72',
                title: 'Brands',
                path: 'purchase'
            },
            {
                id: '73',
                title: 'Products',
                path: 'purchase'
            },
            {
                id: '74',
                title: 'Opening stock',
                path: 'purchase'
            },
            {
                id: '75',
                title: 'Reports',
                path: 'purchase'
            },
            {
                id: '76',
                title: 'Stock journal',
                path: 'purchase'
            },
        ]
    },
    {
        id: '8',
        title: 'Final accounts',
        icon: FinalAccountsIcon,
        path:'purchase',
        children:[]
    }
]

export {accountsMenuData}