import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs'
import { IconMinusCircle } from "../../../../controls/icons/icon-minus-circle";
import { IconPlusCircle } from "../../../../controls/icons/icon-plus-circle";
import { allFinYearsSelectorFn, currentDateFormatSelectorFn, currentFinYearSelectorFn, FinYearType, setCurrentFinYear } from "../../../login/login-slice";
import { Utils } from "../../../../utils/utils";
import { FinYearsListModal } from "./fin-years-list-modal";
import { AppDispatchType } from "../../../../app/store";
import { Messages } from "../../../../utils/messages";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { DatabaseTablesMap } from "../../../../app/maps/database-tables-map";

export function FinYearsOptions() {
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn)
    const allFinYears: FinYearType[] = useSelector(allFinYearsSelectorFn) || []
    const currentDateFormat: string | undefined = useSelector(currentDateFormatSelectorFn)
    const formattedStartDate = dayjs(currentFinYear?.startDate ? currentFinYear.startDate : '').format(currentDateFormat)
    const formattedEndDate = dayjs(currentFinYear?.endDate ? currentFinYear?.endDate : '').format(currentDateFormat)
    const dispatch: AppDispatchType = useDispatch()

    return (
        <div className="ml-4 flex items-center">
            {/* Plus */}
            <button onClick={handleOnClickPlus} title="Next Financial Year" className="ml-1" type="button">
                <IconPlusCircle className="h-7 w-7" />
            </button>
            {/* Financial year */}
            <button onClick={handleOnClickFinYears} className="w-70 ml-1 flex h-8 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow-sm">
                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    FY
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap 
            text-sm font-medium">{`${currentFinYear?.finYearId} (${formattedStartDate} - ${formattedEndDate})`}</span>
            </button>
            {/* minus */}
            <button onClick={handleOnClickMinus} className="ml-1" type="button" title="Previous Financial Year">
                <IconMinusCircle className="h-7 w-7" />
            </button>
        </div>)

    function handleOnClickFinYears() {
        Utils.showHideModalDialogA({
            className: 'ml-2',
            title: "Select a financial year",
            isOpen: true,
            element: <FinYearsListModal />,
        })
    }

    function handleOnClickMinus() {
        if (!currentFinYear) {
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errCurrentFinYear })
            return
        }
        const newFinYearId = currentFinYear.finYearId - 1
        const newFinYear: FinYearType | undefined = allFinYears.find((fy: FinYearType) => fy.finYearId === newFinYearId)
        if (newFinYear) {
            dispatch(setCurrentFinYear(newFinYear))
            saveLastUsedFinYearId(newFinYear.finYearId)
        } else {
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errIncrementedFinYearNotExists })
        }
    }

    function handleOnClickPlus() {
        if (!currentFinYear) {
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errCurrentFinYear })
            return
        }
        const newFinYearId = currentFinYear.finYearId + 1
        const newFinYear: FinYearType | undefined = allFinYears.find((fy: FinYearType) => fy.finYearId === newFinYearId)
        if (newFinYear) {
            dispatch(setCurrentFinYear(newFinYear))
            saveLastUsedFinYearId(newFinYear.finYearId)
        } else {
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errIncrementedFinYearNotExists })
        }
    }

    async function saveLastUsedFinYearId(finYearId: number) {
        const userId: number | undefined = Utils.getCurrentLoginInfo().userDetails?.id;
        const traceDataObject: TraceDataObjectType = {
            tableName: DatabaseTablesMap.UserM,
            xData: {
                id: userId,
                lastUsedFinYearId: finYearId
            }
        };
        try {
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.genericUpdate;
            await Utils.mutateGraphQL(q, queryName);
            Utils.showHideModalDialogA({ isOpen: false });
            Utils.showSuccessAlertMessage({ title: 'Ok', message: Messages.messFinYearSuccessfullyChanged });
        } catch (e: any) {
            console.log(e);
        }
    }

}