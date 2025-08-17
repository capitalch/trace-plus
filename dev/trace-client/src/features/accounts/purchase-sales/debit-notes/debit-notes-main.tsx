import { DebitNotesHeader } from "./debit-notes-header";
import { DebitNotesLineItems } from "./debit-notes-line-items";

export function DebitNotesMain() {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm ">
      <DebitNotesHeader />
      <DebitNotesLineItems />
    </div>
  )
}