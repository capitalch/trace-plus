import { useState } from "react";
import clsx from "clsx";

export function SelectedRowInTable1() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="m-4">
            <table className="w-full">
                <tbody>
                    {data.map((item, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <tr
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={clsx(
                                    "hover:bg-gray-50 cursor-pointer",
                                    isSelected && "outline-4 outline-amber-500"
                                )}
                            >
                                <td className="p-2">{item.code}</td>
                                <td className="p-2">{item.details}</td>
                                <td className="p-2">{item.refNo}</td>
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