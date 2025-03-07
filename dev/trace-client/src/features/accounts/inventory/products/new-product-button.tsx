// import { useDispatch } from "react-redux";
// import { AppDispatchType } from "../../../../app/store/store";
import clsx from "clsx";
// import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";
// import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";

export function NewProductButton({className}:{className?: string}) {
    // const dispatch: AppDispatchType = useDispatch();
    
    const handleOpenNewProductForm = () => {
        // dispatch(openSlidingPane({
        //     componentName: "NewEditProduct",
        //     instance: DataInstancesMap.productMaster,
        //     props: {},
        // }));
    };

    return (
        <button 
            className={clsx("bg-primary-400 text-white w-30 h-10 rounded-md hover:bg-primary-600", className)}
            onClick={handleOpenNewProductForm} 
        >New product</button>
    );
}
