import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootStateType } from "./store";

const initialState: InitialStateType = {
    // login: {
    //     isLoggedIn: false,
    //     uid: '',
    //     email: '',
    //     userType: ''
    // },
    count: 0
}
export const appSlice = createSlice({
    name:'app',
    initialState: initialState,
    reducers: {

        // setIsLoggedIn: (state: InitialStateType, action:PayloadAction<SetIsLoggedInType>)=>{
        //     state.login.isLoggedIn = action.payload.isLoggedIn;
        // }
    }
})

type InitialStateType = {
    // login: {
    //     isLoggedIn: boolean,
    //     uid: string,
    //     email: string,
    //     userType: string
    // },
    count: number
}

// type SetIsLoggedInType = {
//     isLoggedIn: boolean
// }

// Selector functions
export const isLoggedInSelectorFn = (state: RootStateType) => state.