import { FC, } from "react";
import { ContactAndAddresses, } from "../../../features/accounts/masters/accounts/contact-and-addresses";
import { NewEditBranch, NewEditBranchType } from "../../../features/accounts/masters/branch-master/new-edit-branch";
import { ReportAllTransactionsFilter } from "../../../features/accounts/reports/report-all-transactions/report-all-transactions-filter";
import { NewEditBrand, NewEditBrandType } from "../../../features/accounts/inventory/brands/new-edit-brand";
import { NewEditProduct, } from "../../../features/accounts/inventory/product-master/new-edit-product";


export const SlidingPaneMap: SlidingPaneMapType = {
    branchMaster: {
        content: NewEditBranch,
        props: {
            id: undefined,
            branchCode: '',
            branchName: '',
            remarks: undefined
        }
    },
    // branchTransfer:{
    //     content: NewEditBranch,
    //     props: {
    //         id: undefined
    //     }
    // },
    brandMaster: {
        content: NewEditBrand,
        props: {
            id: undefined,
            brandName: '',
            remarks: undefined
        }
    },
    contactAndAddresses: {
        content: ContactAndAddresses,
        props: {
            accId: 0,
            isAddressExists: false
        }
    },
    productMaster: {
        content: NewEditProduct,
        props: {
            id: undefined
        }
    },
    reportAllTransactionsFilter: {
        content: ReportAllTransactionsFilter
    },

}

export enum SlidingPaneEnum {
    branchMaster = 'branchMaster',
    // branchTransfer = 'branchTransfer',
    brandMaster = 'brandMaster',
    contactAndAddresses = 'contactAndAddresses',
    productMaster = 'productMaster',
    reportAllTransactionsFilter = 'reportAllTransactionsFilter'
}

export type SlidingPaneMapType = {
    contactAndAddresses: {
        content: FC<any>;
        props: {
            accId: number
            isAddressExists: boolean
        }
    },
    branchMaster: {
        content: FC<any>;
        props: NewEditBranchType;
    },
    // branchTransfer: {
    //     content: FC<any>
    //     props: {
    //         id: number | undefined
    //     }
    // },
    brandMaster: {
        content: FC<any>;
        props: NewEditBrandType
    },
    productMaster: {
        content: FC<any>
        props: {
            id: number | undefined
        }
    },
    reportAllTransactionsFilter: {
        content: FC<any>
    }
}