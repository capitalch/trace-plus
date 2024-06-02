import clsx from "clsx"
import { ReactElement } from "react"
import { ibukiEmit } from "../../utils/ibuki"
import { IbukiMessages } from "../../utils/ibukiMessages"

function ModalDialog({ body, isOpen, size = 'sm', title, toShowCloseButton = false, instanceName }: ModalDialogType) {
    const sizeLogic = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-4xl' }
    const footerClassName = toShowCloseButton ? 'flex' : 'hidden'
    
    return (
        <>
            {isOpen ? (
                <>
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                        <div className={clsx("relative w-auto max-w-4xl mx-auto", sizeLogic[size])}>

                            {/*content*/}
                            <div className="relative flex flex-col w-full bg-white rounded-lg shadow-lg outline-none focus:outline-none">

                                {/*header*/}
                                <div className="flex items-center justify-between p-5 ">
                                    <label className="text-2xl font-semibold text-primary-500">
                                        {title}
                                    </label>
                                    <button onClick={onClickClose} className="w-6 h-6 px-0 py-0 font-semibold bg-transparent border-0 outline-none focus:outline-none">
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
                                        className="px-6 py-2 text-sm font-bold text-white uppercase border-[1px] bg-primary-400 hover:bg-primary-500 active:bg-primary-600"
                                        type="button"
                                        onClick={onClickClose}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
                </>
            ) : null}
        </>
    )

    function onClickClose() {
        ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-" + instanceName], { isOpen: false, title: undefined, element: <></> })
    }
}

export { ModalDialog }

type ModalDialogType = {
    body?: ReactElement
    defaultData?: any
    isOpen: boolean
    size?: 'sm' | 'md' | 'lg'
    title: string
    toShowCloseButton?: boolean
    instanceName: string
}