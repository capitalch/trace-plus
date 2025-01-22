export function EditNewBranch(props: EditNewBranchType) {
    const { id, branchCode, branchName, remarks } = props
    return (<div>Edit new branch</div>)
}

export type EditNewBranchType = {
    id: number | null
    branchCode: string | null
    branchName: string | null
    remarks: string | null
}