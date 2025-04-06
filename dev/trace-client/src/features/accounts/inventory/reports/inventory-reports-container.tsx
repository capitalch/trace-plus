import { Link, useParams } from "react-router-dom";
import {
  InventoryReportsComponentsMap,
  InventoryReportsRouterMap
} from "./inventory-reports-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";

export function InventoryReportsContainer() {
  const { id } = useParams<{ id: string }>();
  const ReportComponent = id ? InventoryReportsComponentsMap[id] : undefined;

  const title =
    InventoryReportsRouterMap.find((item) => item.id === id)?.name ||
    "Inventory Reports";
  if (!ReportComponent) {
    return <div className="p-4 text-red-500">Invalid Report ID</div>;
  }

  return (
    <CompAccountsContainer>
      <div className="mt-2 ">
        <div className="flex items-center space-x-10 mb-4">
          <label className="text-lg font-semibold text-primary-500">
            {title}
          </label>
          {/* Back Link as Hyperlink */}
          <Link
            to="/inventory-reports-dashboard"
            className="text-sm text-primary-500 hover:underline bg-blue-50 hover:bg-blue-100 rounded-lg px-2 py-1"
          >
            Back to Reports Dashboard
          </Link>
        </div>
        <ReportComponent />
      </div>
    </CompAccountsContainer>
  );
}
