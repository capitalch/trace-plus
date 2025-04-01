import { CompTabs, CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { StockJournalLineItems } from "./stock-journal-line-items";

export function StockJournalSourceOutputTabs({instance}:{instance: string}){
    const tabsInfo: CompTabsType = [
        {
          label: "Source Items",
          content: <StockJournalLineItems instance={instance} name="sourceLineItems" title="Source" />
        },
        {
          label: "Output Items",
          content: <StockJournalLineItems instance={instance} name="outputLineItems" title="Output" />
        }
      ];

      return(<CompTabs tabsInfo= {tabsInfo} instance = {instance} /> )
}