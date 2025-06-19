import clsx from "clsx";
import { WidgetAstrix } from "../widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../widgets/widget-form-error-message";

export function FormField({ label, children, required, error, className }: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    className?: string;
}) {
    return (
        <div className={clsx("flex flex-col text-primary-500 ", className)}>
            <div className="flex items-center gap-1 mb-1.5">
                <span className="font-semibold text-sm">{label}</span>
                {required && <WidgetAstrix />}
            </div>
            {children}
            {error && <WidgetFormErrorMessage errorMessage={error} />}
        </div>
    );
}