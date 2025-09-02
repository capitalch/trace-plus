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
        className="fixed bg-black bg-opacity-50 inset-0 z-[999]"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className={clsx(
          "fixed inset-0 z-[1000] flex items-center justify-center px-2 sm:px-4"
        )}
      >
        <div className="flex flex-col w-full max-w-7xl h-[90vh] bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
            <h2 className="font-semibold text-gray-800 text-lg">{title}</h2>

            <>{customControl}</>
            <button
              type="button"
              className="text-gray-500 text-xl leading-none hover:text-red-500"
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
