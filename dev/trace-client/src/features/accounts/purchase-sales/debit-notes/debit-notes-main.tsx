import { DebitNotesHeader } from "./debit-notes-header";
import { DebitNotesLineItems } from "./debit-notes-line-items";

export function DebitNotesMain(){
    return(<div className="flex flex-col gap-2">
      <DebitNotesHeader />
      <DebitNotesLineItems />
      {/* <PurchaseCommonSubHeader />
      <PurchaseLineItems title="Purchase Line Items" /> */}
    </div>)
}