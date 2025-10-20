import { useFormContext, useWatch } from "react-hook-form"
import { VoucherFormDataType } from "./all-vouchers/all-vouchers"
import { useUserHasMultiplePermissions } from "../../../utils/secured-controls/permissions"

export function useVoucherPermissions(voucherType?: string) {
    const formContext = useFormContext<VoucherFormDataType>()
    const formVoucherType = useWatch({ control: formContext.control, name: "voucherType" })

    const resolvedVoucherType = voucherType || formVoucherType
    const voucherTypeLower = resolvedVoucherType?.toLowerCase() || ""

    // Always call the permissions hook (unconditionally)
    const permissions = useUserHasMultiplePermissions({
        canView: `vouchers.${voucherTypeLower}.view`,
        canSelect: `vouchers.${voucherTypeLower}.select`,
        canCreate: `vouchers.${voucherTypeLower}.create`,
        canEdit: `vouchers.${voucherTypeLower}.edit`,
        canDelete: `vouchers.${voucherTypeLower}.delete`,
        canPreview: `vouchers.${voucherTypeLower}.preview`,
        canExport: `vouchers.${voucherTypeLower}.export`
    })

    // If no voucher type, return all false
    if (!resolvedVoucherType) {
        return {
            canView: false,
            canSelect: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canPreview: false,
            canExport: false
        }
    }
    return permissions
}