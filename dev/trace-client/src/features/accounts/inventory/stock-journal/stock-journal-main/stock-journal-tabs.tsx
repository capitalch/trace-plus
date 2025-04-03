import { useFormContext } from "react-hook-form";
import { CompTabs, CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { StockJournalLineItems } from "./stock-journal-line-items";
import { StockJournalType } from "./stock-journal-main";
import { ProductLineItem } from "../../shared-types";
import _ from "lodash";

export function StockJournalTabs({ instance }: { instance: string }) {
  const { watch } = useFormContext<StockJournalType>()
  const sourceLineItems = watch('sourceLineItems')
  const outputLineItems = watch('outputLineItems')

  const tabsInfo: CompTabsType = [
    {
      label: "Source Items",
      content: <StockJournalLineItems instance={instance} name="sourceLineItems" title="Source (Consumed / Inputs / Credits)" />,
      hasError: hasError(sourceLineItems)
    },
    {
      label: "Output Items",
      content: <StockJournalLineItems instance={instance} name="outputLineItems" title="Output (Produced / Results / Debits)" />,
      hasError: hasError(outputLineItems)
    }
  ];

  return (<CompTabs tabsInfo={tabsInfo} instance={instance} />)

  function hasError(lineItems: Array<ProductLineItem>): boolean {
    let isError: boolean = false
    isError = lineItems.some(item => {
      const serialNumbers = item.serialNumbers
      const sn = serialNumbers ? serialNumbers.replace(/[,;]$/, "") : "";
      const snCount = sn ? sn.split(/[,;]/).length : 0;
      const isProductError = Boolean(!item.productCode)
      const isSnError = (!_.isEmpty(item.serialNumbers)) && (item.qty !== snCount)
      return (isProductError || Boolean(isSnError))
    })
    return (isError)
  }
}