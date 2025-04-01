import { useState } from "react";

export function SelectedRowInTable() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="m-4">
            <table className="border-separate border-spacing-0">
                <tbody>
                    {data.map((item, index) => {
                        const isSelected = index === selectedIndex;

                        return (
                            <tr
                                key={index}
                                className="hover:bg-gray-50"
                                onClick={() => setSelectedIndex(index)}
                            >
                                <td
                                    className={`p-2 border-4 
                                        ${isSelected ? "border-amber-500" : "border-gray-100"}
                                    `}
                                >
                                    {item.code}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

const data = [
    { code: 1111, details: "AAAA", refNo: "aaaaa" },
    { code: 2222, details: "BBBBB", refNo: "bbbbb" },
    { code: 33333, details: "CCCCC", refNo: "ccccc" },
];
