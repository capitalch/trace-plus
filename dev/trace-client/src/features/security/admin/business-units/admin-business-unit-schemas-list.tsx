import { useEffect, useRef, useState } from "react"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { Utils } from "../../../../utils/utils"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { ListBoxComponent } from "@syncfusion/ej2-react-dropdowns"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"

export function AdminBusinessUnitSchemasLisr() {
    const { dbName, decodedDbParamsObject } = useUtilsInfo()
    const listRef = useRef<ListBoxComponent>(null)
    const [dataSource, setDataSource] = useState<{ id: string; text: string }[]>([])

    useEffect(() => {
        loadSchemas()
    }, [])

    return (<ListBoxComponent
        // change={onChange}
        // dataBound={onDataBound}
        dataSource={dataSource}
        height='200'
        ref={listRef}
        selectionSettings={{ mode: 'Multiple' }}
    />)

    async function loadSchemas() {
        try {
            const [resAllSchemas, allBusinessUnits] = await Promise.all([
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
            console.log(resAllSchemas, allBusinessUnits)
            prepareData(resAllSchemas, allBusinessUnits)
        } catch (e) {
            console.error(e)
        }
    }

    // function onChange(args: any) {
        // const selectedBuId: number = args.items[0].id
        // const selectedBu: BusinessUnitType = currentBusinessUnitsSelector.find((u: BusinessUnitType) => u.buId === selectedBuId) || {}
        // dispatch(setCurrentBusinessUnit(selectedBu))
        // if (currentBusinessUnitSelector.buId !== selectedBuId) {
        //     saveLastUsedBuId(selectedBuId)
        // }
    // }

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