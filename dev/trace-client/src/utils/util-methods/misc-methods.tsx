import { RootStateType, store } from "../../app/store/store";

export function getHostUrl() {
    let url
    if (import.meta.env.DEV) {
        url = import.meta.env['VITE_APP_LOCAL_SERVER_URL']
    } else {
        url = window.location.href
    }
    return (url)
}

export function getReduxState(): RootStateType{
    return(store.getState())
}

export function getToken(){
    const state: RootStateType = store.getState();
    return(state.login.token)
}