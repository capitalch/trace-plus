import { ListBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { useRef } from "react";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store/store";

export function SelectBankModal() {
    const listRef: any = useRef(null)
    const instance: string = DataInstancesMap.allBanks
    const allBanks: { accId: number, accName: string }[] = useSelector((state: RootStateType) => state.queryHelper[instance]?.data)
    const { buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        // , finYearId
        // , intFormatter
    } = useUtilsInfo()

    const { loading } = useQueryHelper({
        instance: DataInstancesMap.allBanks,
        dbName: dbName,
        isExecQueryOnLoad: true,
        getQueryArgs: () => ({
            buCode: buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getAllBanks,
            sqlArgs: {}
        })
    })

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<div className='min-w-72'>
        <ListBoxComponent
            change={handleOnChange}
            dataBound={onDataBound}
            dataSource={allBanks}
            fields={{ value: 'accId', text: 'accName' }}
            height='200'
            ref={listRef}
            selectionSettings={{ mode: 'Single' }}
        />
    </div>)

    async function handleOnChange() {

    }

    function onDataBound() {

    }
}