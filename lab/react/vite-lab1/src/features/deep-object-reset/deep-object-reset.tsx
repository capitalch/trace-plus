export function DeepObjectReset() {
    let myObj: any = {
        name: 'Sushant',
        title: 'Agrawal',
        address: {
            address1: '12 JL',
            address2:'Ground floor',
            pin: '700013'
        }
    }
    return (<div className="flex-column m-6 flex">
        <span>Deep object</span>
        <button onClick={onClickResetDeepObject} className="p-2">Reset Deep Object</button>
    </div>)

    function onClickResetDeepObject() {
        myObj = {}
        // myObj.address = {}
        console.log(myObj)
    }
}