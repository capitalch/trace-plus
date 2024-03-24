import ClickAwayListener from "react-click-away-listener"

export function ClickAwayComp1() {
    return (
        <div>
            <ClickAwayListener onClickAway={() => alert('clicked away')}>
                <h1>ClickAwayComp1</h1>
            </ClickAwayListener>
        </div>
    )
}