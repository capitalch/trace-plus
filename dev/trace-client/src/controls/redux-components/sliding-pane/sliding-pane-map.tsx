import { FC } from "react";
import { ContactAndAddresses } from "../../../features/accounts/masters/accounts/contact-and-addresses";

export const SlidingPaneMap: { [key: string]: FC } = {
    contactAndAddresses: ContactAndAddresses
}

export enum SlidingPaneEnum {
    contactAndAddresses = 'contactAndAddresses'
    ,
}
// export type ExampleKeys = keyof typeof SlidingPaneMap