import { FC, } from "react";
import { ContactAndAddresses, } from "../../../features/accounts/masters/accounts/contact-and-addresses";
import { EditNewBranch, EditNewBranchType } from "../../../features/accounts/masters/branch-master/edit-new-branch";


export const SlidingPaneMap: SlidingPaneMapType = {
    branchMaster: {
        content: EditNewBranch,
        props: {
            id: null,
            branchCode: null,
            branchName: null,
            remarks: null
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
    branchMaster :{
        content: FC<any>;
        props: EditNewBranchType;
    }
}