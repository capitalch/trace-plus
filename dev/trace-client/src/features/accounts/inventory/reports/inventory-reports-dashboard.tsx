import { Link } from "react-router-dom";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { InventoryReportsRouterMap } from "./inventory-reports-map";

export function InventoryReportsDashboard() {
  return (
    <CompAccountsContainer>
      {/* <div className="p-4"> */}
        <label className="text-lg font-semibold mb-6 text-primary-600 mt-2">
          Inventory Reports
        </label>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mr-4">
          {InventoryReportsRouterMap.map((report) => (
            <Link
              key={report.id}
              to={`/inventory-reports/${report.id}`}
              className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition duration-200 hover:bg-primary-50"
            >
              <div className="text-primary-500">{report.icon}</div>
              <div className="font-medium text-gray-700">{report.name}</div>
            </Link>
          ))}
        {/* </div> */}
      </div>
      
    </CompAccountsContainer>
  );
}
