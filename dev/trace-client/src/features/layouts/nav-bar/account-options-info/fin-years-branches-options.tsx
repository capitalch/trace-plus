import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { allFinYearsBranchesSelectorFn, BranchType, FinYearType, LoginType, setCurrentBranch, setCurrentFinYear } from "../../../login/login-slice"
import { useEffect } from "react"
import { Utils } from "../../../../utils/utils"
import { AppDispatchType } from "../../../../app/store/store"
import { FinYearsOptions } from "./fin-years-options"
import { BranchesOptions } from "./branches-options"

export function FinYearsBranchesOptions() {
    const allFinYearsBranchesSelector = useSelector(allFinYearsBranchesSelectorFn, shallowEqual)

    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const dispatch: AppDispatchType = useDispatch()

    useEffect(() => {
        if (allFinYearsBranchesSelector.allFinYears) {
            setCurrentFinYearBranch()
        }
    }, [allFinYearsBranchesSelector])

    return (
        <div className="flex items-center">
            <FinYearsOptions />
            <BranchesOptions />
        </div>
    )

    function setCurrentFinYearBranch() {
        const { allFinYears, allBranches } = allFinYearsBranchesSelector
        const currentFinYearId: number = loginInfo?.userDetails?.lastUsedFinYearId || Utils.getRunningFinYearId()
        const currentBranchId: number = loginInfo?.userDetails?.lastUsedBranchId || 1
        const currentFinYearObject: FinYearType | undefined = allFinYears?.find((f: FinYearType) =>
            f.finYearId === currentFinYearId)
        const currentBranchObject: BranchType | undefined = allBranches?.find((b: BranchType) => b.branchId === currentBranchId)
        if (!currentBranchObject) {
            // error
            return
        }
        if(!currentFinYearObject){
            //error
            return
        }

        dispatch(setCurrentBranch(currentBranchObject))
        dispatch(setCurrentFinYear(currentFinYearObject))
    }
}
