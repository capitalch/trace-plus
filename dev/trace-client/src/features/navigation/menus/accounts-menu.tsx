import { Link, } from "react-router-dom"
import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import { useSignal } from "@preact/signals-react"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"

function AccountsMenu() {

    const menuMeta: any = {
        expandedId: useSignal('1'),
        voucherToggle: useSignal(true)
    }
    // const expandedId: string = menuMeta.expandedId.value
    const voucherToggle = menuMeta.voucherToggle.value
    return (
        <div className="flex flex-col text-sm font-semibold prose text-black md:text-base">
            <span onClick={handleOnClick} id='1' className="flex items-center gap-3 py-1 pl-2 hover:cursor-pointer hover:bg-secondary-100 active:bg-secondary-200"><VoucherIcon /><span className="">Vouchers</span><CheveronDownIcon className={`ml-auto mr-2 ${(voucherToggle) ? 'block' : 'hidden'}`} /><CheveronUpIcon className={`ml-auto mr-2 ${(voucherToggle) ? 'hidden' : 'block'}`} /></span>
            <div className={`flex flex-col ${voucherToggle ? 'hidden' : 'block'}`}>
                <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Journals</Link>
                <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Payments</Link>
                <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Receipts</Link>
                <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Contra</Link>
            </div>

            <span className="flex items-center gap-3 py-1 pl-2 mt-2 hover:cursor-pointer hover:bg-secondary-100 active:bg-secondary-200"><VoucherIcon /><span className="">Purchase / sales</span><CheveronDownIcon className='ml-auto mr-2' /></span>

            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Purchases</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Purchase returns</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Sales</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Sales returns</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Debit notes</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Credit notes</Link>
            {/* <span onClick={handlePurchaseClicked} className="pl-4 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Purchase</span> */}
            <span className="flex items-center gap-3 py-1 pl-2 mt-2 hover:cursor-pointer hover:bg-secondary-100 active:bg-secondary-200"><VoucherIcon /><span className="">Masters</span><CheveronDownIcon className='ml-auto mr-2' /></span>

            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Purchases</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Company info</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">General settings</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Accounts</Link>
            <Link to='purchase' className="py-1 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100 active:bg-tertiary-200">Opening balances</Link>
            {/* <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Branches</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">financial years</Link> */}

        </div>
    )

    function handleOnClick() {
        menuMeta.voucherToggle.value = !menuMeta.voucherToggle.value
    }

    // function handlePurchaseClicked() {
    //     navigate('purchase')
    // }

}
export { AccountsMenu }