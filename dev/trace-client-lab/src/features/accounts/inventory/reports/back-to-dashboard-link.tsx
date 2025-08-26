import { Link } from "react-router-dom";

export function BackToDashboardLink() {
    return (
        <Link
            to="/inventory-reports-dashboard"
            className="text-sm text-blue-400 hover:underline hover:text-blue-600 rounded-lg"
        >
            Back to Reports Dashboard
        </Link>
    );
}