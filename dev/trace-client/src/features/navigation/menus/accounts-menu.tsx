import { Link, } from "react-router-dom"
import VoucherIcon from "../../../components/icons/voucher-icon"

function AccountsMenu() {
    // const navigate = useNavigate()
    return (
        <div className="flex flex-col text-sm font-semibold prose text-black md:text-base">
            <span className="flex items-center gap-3 pl-2"><VoucherIcon /><label className="">Vouchers</label></span>
            {/* <div className="flex flex-col"> */}
                <Link to='journals' className="py-2 mt-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Journals</Link>
                <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Payments</Link>
                <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Receipts</Link>
                <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Contra</Link>
            {/* </div> */}
            <span className="flex items-center gap-3 pl-2 mt-2"><VoucherIcon /><label className="">Purchases / sales</label></span>
            <Link to='journals' className="py-2 mt-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Purchases</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Purchase returns</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Sales</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Sales returns</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Debit notes</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Credit notes</Link>
            {/* <span onClick={handlePurchaseClicked} className="pl-4 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Purchase</span> */}
            <span className="flex items-center gap-3 pl-2 mt-2"><VoucherIcon /><label className="">Masters</label></span>
            <Link to='journals' className="py-2 mt-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Purchases</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Company info</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">General settings</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Accounts</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Opening balances</Link>
            {/* <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">Branches</Link>
            <Link to='payments' className="py-2 no-underline pl-9 hover:cursor-pointer hover:text-primary-500 hover:bg-tertiary-100">financial years</Link> */}

        </div>
    )

    // function handlePurchaseClicked() {
    //     navigate('purchase')
    // }

}
export { AccountsMenu }