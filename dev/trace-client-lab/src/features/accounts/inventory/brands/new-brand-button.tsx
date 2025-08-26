import clsx from "clsx";
import { NewEditBrandType } from "./new-edit-brand";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";
import { AppDispatchType } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";

export function NewBrandButton({ className }: { className?: string }) {
    const dispatch: AppDispatchType = useDispatch();

    function handleNewBrand() {
        const props: NewEditBrandType = SlidingPaneMap[SlidingPaneEnum.brandMaster].props;
        props.id = undefined;
        props.brandName = '';
        props.remarks = undefined;

        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.brandMaster,
            title: 'New Brand',
            width: '600px'
        }));
    }

    return (
        <button
            className={clsx("bg-primary-400 text-white w-20 h-10 rounded-md hover:bg-primary-600", className)}
            onClick={handleNewBrand}
        >
            New
        </button>
    );
}