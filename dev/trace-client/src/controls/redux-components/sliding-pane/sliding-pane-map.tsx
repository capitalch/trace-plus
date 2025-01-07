import { FC, } from "react";
import { ContactAndAddresses, } from "../../../features/accounts/masters/accounts/contact-and-addresses";


export const SlidingPaneMap: SlidingPaneMapType = {
    contactAndAddresses: {
        content: ContactAndAddresses,
        props: { accId: 0, isAddressExists: false }
    }
}

export enum SlidingPaneEnum {
    contactAndAddresses = 'contactAndAddresses'
    ,
}

export type SlidingPaneMapType = {
    [key: string]: {
        content: FC<any>;
        props: {
            accId: number,
            isAddressExists: boolean
        }
    }
}