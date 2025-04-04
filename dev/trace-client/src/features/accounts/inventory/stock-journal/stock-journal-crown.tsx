import { useFormContext, useWatch } from "react-hook-form";
import { StockJournalType } from "./stock-journal-main/stock-journal-main";
import clsx from "clsx";
import Decimal from "decimal.js";

export function StockJournalCrown({
  className,
}: {
  className?: string;
}) {
  const { control } = useFormContext<StockJournalType>(); // Access the form context
  // Watch the inputLineItems and outputLineItems fields
  const inputLineItems = useWatch({ control, name: "inputLineItems" }) || [];
  const outputLineItems = useWatch({ control, name: "outputLineItems" }) || [];

  // Calculate totals using Decimal.js
  const inputQty = inputLineItems.reduce(
    (sum, item) => new Decimal(sum).plus(item.qty || 0),
    new Decimal(0)
  );
  const outputQty = outputLineItems.reduce(
    (sum, item) => new Decimal(sum).plus(item.qty || 0),
    new Decimal(0)
  );
  const inputValue = inputLineItems.reduce(
    (sum, item) =>
      new Decimal(sum).plus(new Decimal(item.qty || 0).times(item.price || 0)),
    new Decimal(0)
  );
  const outputValue = outputLineItems.reduce(
    (sum, item) =>
      new Decimal(sum).plus(new Decimal(item.qty || 0).times(item.price || 0)),
    new Decimal(0)
  );
  const difference = outputValue.minus(inputValue);
  return (
    <div
    className={clsx(
      "ml-auto flex items-center gap-2 text-sm font-medium text-gray-500",
      className
    )}
  >
    <div className="flex items-center gap-2">
      <span className="font-medium ">In qty:</span>
      <span className="font-semibold text-gray-900">{inputQty.toFixed(2)}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-medium">Out qty:</span>
      <span className="font-semibold text-gray-900">{outputQty.toFixed(2)}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-medium">In amt:</span>
      <span className="font-semibold text-gray-900">{inputValue.toFixed(2)}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-medium">Out amt:</span>
      <span className="font-semibold text-gray-900">{outputValue.toFixed(2)}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-medium">Difference:</span>
      <span
        className={clsx(
          "font-semibold",
          difference.gte(0) ? "text-green-600" : "text-red-600"
        )}
      >
        {difference.toFixed(2)}
      </span>
    </div>
  </div>
  );
}
