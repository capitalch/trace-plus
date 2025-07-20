import { ListBoxChangeEventArgs, ListBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { useRef } from "react";
import _ from 'lodash'
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { selectBank, SelectedBankType, } from "../../accounts-slice";
import { Utils } from "../../../../utils/utils";

export function SelectBankModal() {
    const dispatch: AppDispatchType = useDispatch()
    const listRef: any = useRef(null)
    const instance: string = DataInstancesMap.allBanks
    const allBanks: { accId: number, accName: string }[] = useSelector((state: RootStateType) => state.queryHelper[instance]?.data)
    const { buCode
        , dbName
        , decodedDbParamsObject
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

    return (<div>
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

    async function handleOnChange(args: ListBoxChangeEventArgs) {
        if(_.isEmpty(args?.items)){
            return
        }
        const selectedItem: any = args.items[0]
        dispatch(selectBank({ accId: selectedItem.accId, accName: selectedItem.accName }))
        Utils.showHideModalDialogA({ isOpen: false });
    }

    function onDataBound(){
        const selectedBank: SelectedBankType = Utils.getReduxState().accounts.bankRecon.selectedBank
        const currentAccName: string = selectedBank.accName
        if(currentAccName){
            if(listRef?.current){
                listRef.current.selectItems([currentAccName])
            }
        }
    }
}