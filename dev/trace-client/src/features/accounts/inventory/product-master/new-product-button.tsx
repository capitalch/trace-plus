import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store";
import clsx from "clsx";
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";

export function NewProductButton({ className }: { className?: string }) {
    const dispatch: AppDispatchType = useDispatch();

    return (
        <button
            className={clsx("bg-primary-400 text-white w-30 h-8 rounded-md hover:bg-primary-600 mb-1", className)}
            onClick={handleOpenNewProduct}
        >New product</button>
    );

    function handleOpenNewProduct() {
        const props = SlidingPaneMap[SlidingPaneEnum.productMaster].props;
        props.id = undefined;
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.productMaster,
            title: "New Product",
            width: "700px"
        }));
    }
}
