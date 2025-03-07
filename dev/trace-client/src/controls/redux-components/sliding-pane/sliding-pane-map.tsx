import { FC, } from "react";
import { ContactAndAddresses, } from "../../../features/accounts/masters/accounts/contact-and-addresses";
import { NewEditBranch, NewEditBranchType } from "../../../features/accounts/masters/branch-master/new-edit-branch";
import { ReportAllTransactionsFilter } from "../../../features/accounts/reports/report-all-transactions/report-all-transactions-filter";
import { NewEditBrand, NewEditBrandType } from "../../../features/accounts/inventory/brands/new-edit-brand";


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
    reportAllTransactionsFilter: {
        content: ReportAllTransactionsFilter
    }
}

export enum SlidingPaneEnum {
    branchMaster = 'branchMaster',
    brandMaster = 'brandMaster',
    contactAndAddresses = 'contactAndAddresses',
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
    brandMaster: {
        content: FC<any>;
        props: NewEditBrandType
    },
    reportAllTransactionsFilter: {
        content: FC<any>
    }
}