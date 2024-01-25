function useAppUtils() {
    function getHostUrl() {
        let url
        if(import.meta.env.DEV){
            url=import.meta.env['VITE_APP_LOCAL_SERVER_URL']
        } else {
            url =  window.location.href
        }
        return (url)
    }

    return ({ getHostUrl })
}
export { useAppUtils }