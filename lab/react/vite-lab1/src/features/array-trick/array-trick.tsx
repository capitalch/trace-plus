import _ from "lodash"

function ArrayTrick() {
    // const nestedArray = ['address1', 'address2', 'pin', ['status']]
    const nestedObject: any = {
        address: '12 J.L',
        pin: '700013',
        status: {
            name: 'active'
        },

    }
    return (<div className="m-2">
        <button className="px-2 bg-slate-200" onClick={handleClick}>Do Trick</button>
    </div>)

    function handleClick() {
        const value1 = _.get(nestedObject,'status.name')
        const value = getValue('status.name')
        alert(value1)
        console.log(value)
    }

    function getValue(item: string) {
        let ret: any = ''
        if (item.includes('.')) {
            const itemArray = item.split('.')
            ret = getIteratedValue(itemArray)

        } else {
            ret = nestedObject[item]
        }
        return (ret)
    }

    function getIteratedValue(itemArray: string[]) {
        let obj: any = _.cloneDeep(nestedObject)
        itemArray.forEach((x: string) => {
            obj  = obj[x]
        })
        return(obj)
    }
}

export { ArrayTrick }