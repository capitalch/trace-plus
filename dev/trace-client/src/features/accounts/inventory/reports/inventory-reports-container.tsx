import { useParams } from "react-router-dom";
import {
  InventoryReportsComponentsMap,
  InventoryReportsRouterMap
} from "./inventory-reports-map";
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";

export function InventoryReportsContainer() {
  const { id } = useParams<{ id: string }>();
  const ReportComponent = id
    ? InventoryReportsComponentsMap[id]
    : ({ title }: { title?: string }) => {
        console.log(title);
        return <div className="p-4 text-red-500">Invalid Report ID</div>;
      };

  let title =
    InventoryReportsRouterMap.find((item) => item.id === id)?.name ||
    "Inventory";
  title = `${title} Report`;

  return (
    <CompAccountsContainer
      // CustomControl={() => <button type="button" className="bg-amber-300">Test</button>}
      // MiddleCustomControl={() => <div className="bg-amber-300">Test</div>}
    >
      <div className="">
        <div className="flex items-center mb-2 space-x-10"></div>
        <ReportComponent title={title} />
      </div>
    </CompAccountsContainer>
  );
}
