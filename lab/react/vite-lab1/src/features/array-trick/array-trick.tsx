function ArrayTrick(){
    // const nestedArray = ['address1', 'address2', 'pin', ['status']]
    const nestedObject = {
        address: '12 J.L',
        pin: '700013',
        status: {
            name: 'active'
        },

    }
    return(<div className="m-2">
        <button className="px-2 bg-slate-200" onClick={handleClick}>Do Trick</button>
    </div>)

    function handleClick(){

    }

    function getValue(item: string){
        if(item.includes('.')){
            const itemArray = item.split('.')

        }
    }

    function doIterate(itemArray: string[]){
        itemArray.forEach((x:string)=>{
            
        })
    }
}

export {ArrayTrick}