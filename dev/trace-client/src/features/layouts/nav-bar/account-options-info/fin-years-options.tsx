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
import { AllTables } from "../../../../app/maps/database-tables-map";
import { useMediaQuery } from "react-responsive";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { toggleBusinessContext } from "../../layouts-slice";

export function FinYearsOptions() {
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn)
    const allFinYears: FinYearType[] = useSelector(allFinYearsSelectorFn) || []
    const currentDateFormat: string | undefined = useSelector(currentDateFormatSelectorFn)
    const formattedStartDate = dayjs(currentFinYear?.startDate ? currentFinYear.startDate : '').format(currentDateFormat)
    const formattedEndDate = dayjs(currentFinYear?.endDate ? currentFinYear?.endDate : '').format(currentDateFormat)
    const dispatch: AppDispatchType = useDispatch()
    const isMobile = useMediaQuery({ query: '(max-width: 639px)' })

    return (
        <div className={`flex items-center ${isMobile ? 'ml-0' : 'ml-2 sm:ml-4'}`}>
            {/* Plus - hide on mobile */}
            {!isMobile && (
                <button onClick={handleOnClickPlus} title="Next Financial Year" className="ml-1" type="button">
                    <IconPlusCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </button>
            )}
            {/* Financial year */}
            <TooltipComponent content={`${currentFinYear?.finYearId} (${formattedStartDate} - ${formattedEndDate})`} position="BottomCenter">
                <button onClick={handleOnClickFinYears}
                    className={`flex items-center ${isMobile ? 'px-1 py-1 h-6' : 'ml-1 px-2 py-2 h-8'} text-gray-800 bg-gray-200 rounded-full shadow-sm`}>
                    {/* Badge section */}
                    <div className={`${isMobile ? 'px-0.5 py-0.5' : 'px-1 py-1'} font-bold text-white text-xs bg-blue-500 rounded-full`}>
                        FY
                    </div>
                    {/* Text section - show only on tablet+ */}
                    {!isMobile && (
                        <span className="ml-1 font-medium text-ellipsis text-xs sm:text-sm whitespace-nowrap overflow-hidden max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {`${currentFinYear?.finYearId} (${formattedStartDate} - ${formattedEndDate})`}
                        </span>
                    )}
                </button>
            </TooltipComponent>
            {/* minus - hide on mobile */}
            {!isMobile && (
                <button onClick={handleOnClickMinus} className="ml-1" type="button" title="Previous Financial Year">
                    <IconMinusCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </button>
            )}
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
            dispatch(toggleBusinessContext()) // inform other modules about business context change
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
            dispatch(toggleBusinessContext()) // inform other modules about business context change
        } else {
            Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errIncrementedFinYearNotExists })
        }
    }

    async function saveLastUsedFinYearId(finYearId: number) {
        const userId: number | undefined = Utils.getCurrentLoginInfo().userDetails?.id;
        const traceDataObject: TraceDataObjectType = {
            tableName: AllTables.UserM.name,
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