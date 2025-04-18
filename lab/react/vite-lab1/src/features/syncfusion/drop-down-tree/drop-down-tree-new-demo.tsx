import { useState } from "react";
import ReactSlidingPane from "react-sliding-pane";
import { FilterControl } from "./filter-control";

export function DropDownTreeNewDemo() {
    const [isPaneOpen, setIsPaneOpen] = useState(false);
    return (<div className="m-4">
        <button className="px-2 py-1 bg-primary-500 text-white rounded-lg" onClick={openPane}>Open</button>
        <ReactSlidingPane
            isOpen={isPaneOpen}
            title="Filter Options"
            onRequestClose={() => setIsPaneOpen(false)}
            width="500px"
        >
            <FilterControl />
        </ReactSlidingPane>
    </div>)

    function openPane() {
        setIsPaneOpen(true)
    }
}

export type CategoryType = {
    id: string | number;
    catName: string;
    parentId: string | number | null;
    isLeaf?: boolean;
    hasChild?: boolean;
};

export type BrandType = { id: number | null; brandName: string };

export type TagType = { id: number | null; tagName: string };