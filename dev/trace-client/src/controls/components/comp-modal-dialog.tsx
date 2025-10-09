import clsx from "clsx"
import { ibukiEmit } from "../../utils/ibuki"
import { IbukiMessages } from "../../utils/ibukiMessages"

// My version improved 3.0



export function CompModalDialog({
  body,
  className,
  isOpen,
  size = "sm",
  title,
  toShowCloseButton = false,
  instanceName,
}: CompModalDialogType) {
  if (!isOpen) return null; // Prevent rendering when closed

  const sizeLogic = {
    sm: "w-full max-w-sm",
    md: "w-full md:max-w-xl",
    lg: "w-full lg:max-w-4xl",
    xlg: "w-full max-w-6xl",
    xl: "w-full xl:max-w-[90vw]",
  };

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={clsx("relative mx-4 sm:mx-0", sizeLogic[size])}>
          <div className="flex flex-col max-h-[95vh] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded-lg shadow-2xl">

            {/* Header */}
            <div className={clsx("flex items-center justify-between px-4 py-2 border-b border-slate-300 bg-gradient-to-r from-indigo-100 to-indigo-200", className)}>
              <h2 className="text-lg font-semibold text-indigo-800">{title}</h2>
              <button
                onClick={onClickClose}
                className="p-2 text-indigo-700 hover:text-red-600 hover:bg-indigo-50 rounded transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Body - Scrollable for large content */}
            <div className="flex-1 px-4 py-2 bg-white">{body}</div>

            {/* Footer */}
            {toShowCloseButton && (
              <div className="flex justify-end p-4 border-t">
                <button
                  className="px-6 py-2 text-sm font-bold uppercase text-white bg-primary-400 border hover:bg-primary-500"
                  onClick={onClickClose}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  function onClickClose() {
    const ibukiMessage =
      instanceName === "A"
        ? IbukiMessages["SHOW-MODAL-DIALOG-A"]
        : IbukiMessages["SHOW-MODAL-DIALOG-B"];
    ibukiEmit(ibukiMessage, { isOpen: false, title: undefined, element: <></> });
  }
}

// Component Props Type
type CompModalDialogType = {
  body?: React.ReactElement;
  className?: string;
  isOpen: boolean;
  size?: "sm" | "md" | "lg" | "xlg" | "xl";
  title: string;
  toShowCloseButton?: boolean;
  instanceName: string;
};