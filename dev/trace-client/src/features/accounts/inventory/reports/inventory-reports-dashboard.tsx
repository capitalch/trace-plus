import { Link } from "react-router-dom";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { InventoryReportsRouterMap } from "./inventory-reports-map";

export function InventoryReportsDashboard() {
  return (
    <CompAccountsContainer>
        <label className="mt-2 mb-6 font-semibold text-lg text-primary-600">
          Inventory Reports
        </label>
        <div className="grid mr-4 2xl:grid-cols-5 gap-4 grid-cols-1 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
          {InventoryReportsRouterMap.map((report) => (
            <Link
              key={report.id}
              to={`/inventory-reports/${report.id}`}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition duration-200 hover:bg-primary-50 hover:shadow-md space-x-4"
            >
              <div className="text-primary-500">{report.icon}</div>
              <div className="font-medium text-gray-700">{report.name}</div>
            </Link>
          ))}
      </div>
      
    </CompAccountsContainer>
  );
}
