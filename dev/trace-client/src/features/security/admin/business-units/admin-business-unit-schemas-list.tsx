import { useEffect, useRef, useState } from "react"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { Utils } from "../../../../utils/utils"
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map"
import { ListBoxComponent } from "@syncfusion/ej2-react-dropdowns"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"
import { IconLink } from "../../../../controls/icons/icon-link"
import Swal from "sweetalert2"
import { AllTables } from "../../../../app/maps/database-tables-map"
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map"
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { BusinessUnitType, LoginType, setUserBusinessUnits } from "../../../login/login-slice"
import { AppDispatchType } from "../../../../app/store"
import { useDispatch } from "react-redux"

export function AdminBusinessUnitSchemasLisr() {
    const dispatch: AppDispatchType = useDispatch()
    const { context, dbName, decodedDbParamsObject } = useUtilsInfo()
    const listRef = useRef<ListBoxComponent>(null)
    const [dataSource, setDataSource] = useState<{ id: string; text: string }[]>([])
    const [selectedBuCode, setSelectedBuCode] = useState<string | null>(null)

    useEffect(() => {
        loadSchemasDiff()
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <ListBoxComponent
                change={onChange}
                // dataBound={onDataBound}
                dataSource={dataSource}
                height='200'
                ref={listRef}

                selectionSettings={{ mode: 'Single' }}
            />
            <button type="button" onClick={handleOnLink} disabled={selectedBuCode ? false : true}
                className="inline-flex items-center justify-center px-5 py-2 font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-800 focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:bg-blue-200 dark:bg-blue-600 dark:focus:ring-blue-800 dark:hover:bg-blue-700">
                <IconLink className="mr-4 w-6 h-6 text-white" />
                Link
            </button>
        </div>
    )

    async function handleOnLink() {
        const { value: text } = await Swal.fire({
            input: "text",
            inputLabel: "Enter Business Unit Name",
            inputPlaceholder: "Type Business Unit Name here...",
            inputAttributes: {
                "aria-label": "Type your business unit name here"
            },
            showCancelButton: true
        });
        if (text) {
            await onSave(text)
        }
    }

    async function onSave(text: string) {
        try {
            const traceDataObject: TraceDataObjectType = {
                tableName: AllTables.BuM.name,
                xData: {
                    buCode: selectedBuCode,
                    buName: text,
                    clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId,
                    isActive: true
                }
            };
            const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            const queryName: string = GraphQLQueriesMapNames.genericUpdate;
            await Utils.mutateGraphQL(q, queryName);
            setSelectedBuCode(null)
            await loadSchemasDiff()
            const loadData = context.CompSyncFusionGrid[DataInstancesMap.adminBusinessUnits].loadData
            if (loadData) {
                await loadData()
            }
            const loginInfo: LoginType = Utils.getCurrentLoginInfo()
            const allBusinessUnits: BusinessUnitType[] = loginInfo.allBusinessUnits || []
            dispatch(setUserBusinessUnits(allBusinessUnits))
            Utils.showSaveMessage()
        } catch (e) {
            console.error(e)
        }
    }

    async function loadSchemasDiff() {
        try {
            const [resAllSchemas, resAllBusinessUnits] = await Promise.all([
                Utils.doGenericQuery({
                    dbName: dbName || '',
                    buCode: '',
                    dbParams: decodedDbParamsObject,
                    sqlId: SqlIdsMap.getAllSchemasInDatabase,
                    sqlArgs: {
                        pg: 'pg_%',
                        inf: 'information_schema'
                    }
                }),
                Utils.doGenericQuery({
                    dbName: GLOBAL_SECURITY_DATABASE_NAME,
                    buCode: 'public',
                    sqlId: SqlIdsMap.allBusinessUnits,
                    sqlArgs: { clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId || 0 }
                })
            ])
            prepareData(resAllSchemas, resAllBusinessUnits)
        } catch (e) {
            console.error(e)
        }
    }

    function onChange(args: any) {
        const selectedBuCode = args.items[0].id
        setSelectedBuCode(selectedBuCode)
        // const selectedBu: BusinessUnitType = currentBusinessUnitsSelector.find((u: BusinessUnitType) => u.buId === selectedBuId) || {}
        // dispatch(setCurrentBusinessUnit(selectedBu))
        // if (currentBusinessUnitSelector.buId !== selectedBuId) {
        //     saveLastUsedBuId(selectedBuId)
        // }
    }

    function prepareData(allSchemasRes: { nspname: string }[],
        allBusinessUnitsRes: { buCode: string }[]) {
        const allSchemas = allSchemasRes.map(x => x.nspname)
        const allBusinessUnits = allBusinessUnitsRes.map(x => x.buCode)

        // Get schemas that are in allSchemas but not in allBusinessUnits
        const diff = allSchemas.filter(schema => !allBusinessUnits.includes(schema))

        // Prepare for ListBoxComponent
        const formatted = diff.map((schema) => ({
            id: schema,
            text: schema
        }))
        setDataSource(formatted)
    }

}