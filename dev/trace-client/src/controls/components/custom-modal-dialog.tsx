import clsx from "clsx";
import { ReactElement } from "react";

export function CustomModalDialog({
  isOpen,
  onClose,
  title,
  element,
  customControl = <></>
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  element: ReactElement;
  customControl?: ReactElement;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className={clsx(
          "fixed inset-0 z-[1000] flex items-center justify-center px-2 sm:px-4"
        )}
      >
        <div className="w-full h-[90vh] max-w-7xl bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-300">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

            <>{customControl}</>
            <button
              type="button"
              className="text-gray-500 hover:text-red-500 text-xl leading-none"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="flex-1">
            {element}
          </div>
        </div>
      </div>
    </>
  );
}
