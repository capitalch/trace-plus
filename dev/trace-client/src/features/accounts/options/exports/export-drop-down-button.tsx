import { useState } from "react";

export function ExportDropDownButton() {
    const [selectedType, setSelectedType] = useState(fileTypes[0]);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelection = (type: any) => {
        setSelectedType(type);
        setIsOpen(false);
        alert(`Exporting as ${type}`);
    };

    return (
        <div className="relative inline-block text-left">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-md w-56">
                <button
                    className="bg-blue-600 text-white px-6 py-2 font-medium rounded-l-lg hover:bg-blue-700 transition w-full"
                    onClick={() => alert(`Exporting as ${selectedType}`)}
                >
                    Export as {selectedType}
                </button>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg border-l border-white/20 hover:bg-blue-700 transition"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    ▼
                </button>
            </div>
            {isOpen && (
                <div className="absolute mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                    {fileTypes.map((type) => (
                        <button
                            key={type}
                            className="w-full px-4 py-3 text-left hover:bg-blue-100 transition duration-200"
                            onClick={() => handleSelection(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const fileTypes = ["XLSX", "PDF", "CSV", "JSON"];