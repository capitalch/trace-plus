import { FC, } from "react";
import { ContactAndAddresses, } from "../../../features/accounts/masters/accounts/contact-and-addresses";
import { NewEditBranch, EditNewBranchType } from "../../../features/accounts/masters/branch-master/new-edit-branch";


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
    contactAndAddresses: {
        content: ContactAndAddresses,
        props: {
            accId: 0,
            isAddressExists: false
        }
    }
}

export enum SlidingPaneEnum {
    branchMaster = 'branchMaster',
    contactAndAddresses = 'contactAndAddresses',
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
        props: EditNewBranchType;
    }
}