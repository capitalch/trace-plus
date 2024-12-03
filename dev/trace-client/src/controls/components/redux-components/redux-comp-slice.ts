import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootStateType } from "../../../app/store/store"

const initialState: ReduxCompInitialStateType = {
    reduxCompSwitch: {}
}

const reduxCompSlice = createSlice({
    name: 'reduxComp',
    initialState: initialState,
    reducers: {
        changeReduxCompSwitch: (state: ReduxCompInitialStateType, action: PayloadAction<ReduxCompSwitchActionStateType>) => {
            const instance: string = action.payload.instance
            state.reduxCompSwitch[instance] = action.payload.switchState
        }
    }
})

export const reduxCompReducer = reduxCompSlice.reducer
export const { changeReduxCompSwitch } = reduxCompSlice.actions

type ReduxCompInitialStateType = {
    reduxCompSwitch: {
        [key: string]: boolean
    }
}

type ReduxCompSwitchActionStateType = {
    instance: string
    switchState: boolean
}

// selectors
export const reduxCompSwitchSelectorFn = (state: RootStateType, instance: string) =>
    state.reduxComp.reduxCompSwitch[instance]