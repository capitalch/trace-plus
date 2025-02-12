import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function ReactDatePicker() {
    const [startDate, setStartDate] = useState(new Date());
    return <DatePicker className="" showIcon={true} selected={startDate} onChange={(date: any) => setStartDate(date)} />;
}