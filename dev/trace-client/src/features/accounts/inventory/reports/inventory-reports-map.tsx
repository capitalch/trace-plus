import { FC, ReactElement } from "react"
// import { IconArrange } from "../../../../controls/icons/icon-arrange"
import { IconCurrentOrders } from "../../../../controls/icons/report-icons/icon-current-order"
import { IconProductList } from "../../../../controls/icons/report-icons/icon-product-list"
import { IconPurchasePriceVariation } from "../../../../controls/icons/report-icons/icon-purchase-price-variation"
import { IconPurchase } from "../../../../controls/icons/report-icons/icon-purchase"
import { IconSales } from "../../../../controls/icons/report-icons/icon-sales"
import { IconStockSummary } from "../../../../controls/icons/report-icons/icon-stock-summary"
import { IconStockTransactions } from "../../../../controls/icons/report-icons/icon-stock-transactions"
import { CurrentOrdersReport } from "./inventory-reports/current-orders-report"
import { ProductsListReport } from "./inventory-reports/products-list-report"
import { PurchasePriceVariationReport } from "./inventory-reports/purchase-price-variation-report"
import { PurchasesReport } from "./inventory-reports/purchases-report"
import { SalesReport } from "./inventory-reports/sales-report"
import { StockSummaryReport } from "./inventory-reports/stock-summary-report"
import { StockTransactionsReport } from "./inventory-reports/stock-transactions-report"

type InventoryReportItemType = {
    id: string
    name: string
    icon: ReactElement
}
export const InventoryReportsRouterMap: InventoryReportItemType[] = [
    {
        id: "current-orders",
        name: "Current Orders",
        icon: <IconCurrentOrders className="text-blue-500"/>
    },
    {
        id: "products-list",
        name: "Products List",
        icon: <IconProductList />
    },
    {
        id: "purchase-price-variation",
        name: "Purchase Price Variation",
        icon: <IconPurchasePriceVariation />
    },
    {
        id: "all-purchases",
        name: "Purchases",
        icon: <IconPurchase className="text-cyan-500" />
    },
    {
        id: "all-sales",
        name: "Sales",
        icon: <IconSales className="text-amber-500" />
    },
    {
        id: "stock-summary",
        name: "Stock Summary",
        icon: <IconStockSummary />
    },
    {
        id: "stock-transactions",
        name: "Stock Transactions",
        icon: <IconStockTransactions />
    }
]

export const InventoryReportsComponentsMap : Record<string,FC> = {
    "current-orders": CurrentOrdersReport,
    "products-list": ProductsListReport,
    "purchase-price-variation": PurchasePriceVariationReport,
    "all-purchases": PurchasesReport,
    "all-sales": SalesReport,
    "stock-summary": StockSummaryReport,
    "stock-transactions": StockTransactionsReport
}

