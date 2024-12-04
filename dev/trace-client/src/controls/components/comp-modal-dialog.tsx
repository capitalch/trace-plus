import clsx from "clsx"
import { ReactElement } from "react"
import { ibukiEmit } from "../../utils/ibuki"
import { IbukiMessages } from "../../utils/ibukiMessages"
// import Draggable from "react-draggable"

export function CompModalDialog({ body, className, isOpen, size = 'sm', title, toShowCloseButton = false, instanceName }: CompModalDialogType) {
    const sizeLogic = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-4xl' }
    const footerClassName = toShowCloseButton ? 'flex' : 'hidden'

    return (
        <>
            {isOpen ? (
                <>
                    {/* <Draggable className=''> */}
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
                        <div className={clsx("relative w-auto max-w-4xl mx-auto", sizeLogic[size])}>

                            {/*content*/}
                            <div className="relative flex w-full flex-col rounded-lg bg-white shadow-lg outline-none focus:outline-none">

                                {/*header*/}
                                <div className={clsx("flex items-center justify-between p-4", className)}>
                                    <label className="text-lg font-semibold text-primary-500">
                                        {title}
                                    </label>
                                    <button onClick={onClickClose} className="ml-auto mt-1 h-6 w-6 cursor-pointer border-0 bg-transparent px-0 py-0 font-semibold outline-none focus:outline-none">
                                        X
                                    </button>
                                </div>

                                {/*body*/}
                                <div className="relative flex-auto p-6 pt-0">
                                    {/* {body({ defaultData })} */}
                                    {body}
                                </div>

                                {/*footer*/}
                                <div className={clsx("flex ml-auto mr-6 mb-6 ", footerClassName)} >
                                    <button
                                        className="border-[1px] bg-primary-400 px-6 py-2 text-sm font-bold uppercase text-white hover:bg-primary-500 active:bg-primary-600"
                                        type="button"
                                        onClick={onClickClose}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
                    {/* </Draggable> */}
                </>
            ) : null}
        </>
    )

    function onClickClose() {
        const ibukiMessage: string = (instanceName === 'A') ? IbukiMessages["SHOW-MODAL-DIALOG-A"] : IbukiMessages["SHOW-MODAL-DIALOG-B"]
        ibukiEmit(ibukiMessage, { isOpen: false, title: undefined, element: <></> })
    }
}

type CompModalDialogType = {
    body?: ReactElement
    className?: string
    defaultData?: any
    isOpen: boolean
    size?: 'sm' | 'md' | 'lg'
    title: string
    toShowCloseButton?: boolean
    instanceName: string
}