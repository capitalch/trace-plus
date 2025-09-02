import { Link } from "react-router-dom";

export function BackToDashboardLink() {
    return (
        <Link
            to="/inventory-reports-dashboard"
            className="text-blue-400 text-sm rounded-lg hover:text-blue-600 hover:underline"
        >
            Back to Reports Dashboard
        </Link>
    );
}