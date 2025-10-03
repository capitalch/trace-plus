import { CreditNotesHeader } from "./credit-notes-header";
import { CreditNotesLineItems } from "./credit-notes-line-items";

export function CreditNotesMain() {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm">
      <CreditNotesHeader />
      <CreditNotesLineItems />
    </div>
  )
}