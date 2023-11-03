import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { MenuItemType } from "./menu-items-type"

const accountsMenuData: MenuItemType[] = [
    {
        id: '1',
        title: 'Vouchers',
        icon: <VoucherIcon />,
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
        icon: <VoucherIcon />,
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
                path: 'purchase'
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
        icon: <VoucherIcon />,
        children: [
            {
                id: '31',
                title: 'Purchases',
                path: 'purchase'
            },
            {
                id: '32',
                title: 'Company info',
                path: 'purchase'
            },
            {
                id: '33',
                title: 'General settings',
                path: 'purchase'
            },
            {
                id: '34',
                title: 'Accounts',
                path: 'purchase'
            },
            {
                id: '35',
                title: 'Opening balances',
                path: 'purchase'
            },
        ]
    }

]

export {accountsMenuData}