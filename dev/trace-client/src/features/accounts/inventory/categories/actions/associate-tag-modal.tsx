import { useSelector } from "react-redux"
import { DataInstancesMap } from "../../../../../app/graphql/maps/data-instances-map"
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map"
import { useQueryHelper } from "../../../../../app/graphql/query-helper-hook"
import { WidgetLoadingIndicator } from "../../../../../controls/widgets/widget-loading-indicator"
import { useUtilsInfo } from "../../../../../utils/utils-info-hook"
import { RootStateType } from "../../../../../app/store/store"
import { CompReactSelect } from "../../../../../controls/components/comp-react-select"
import { WidgetButtonSubmitFullWidth } from "../../../../../controls/widgets/widget-button-submit-full-width"
import { useEffect, useRef, useState } from "react"
import _ from "lodash"
import { Utils } from "../../../../../utils/utils"
import { DatabaseTablesMap } from "../../../../../app/graphql/maps/database-tables-map"

export function AssociateTagModal({ catId, id }: { catId: number, id: number | undefined }) {
    const [, setRefresh] = useState({})
    const instance = DataInstancesMap.allTags
    const allTags: { id: number, tagName: string }[] = useSelector((state: RootStateType) => state.queryHelper[instance]?.data)
    const meta = useRef<MetaType>({
        rows: [],
        selectedTagId: id || null
    })
    const { buCode
        , context
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    const { loading } = useQueryHelper({
        instance: instance,
        dbName: dbName,
        isExecQueryOnLoad: true,
        getQueryArgs: () => ({
            buCode: buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getTags,
            sqlArgs: {}
        })
    })

    useEffect(() => {
        if (!_.isEmpty(allTags)) {
            meta.current.rows = _.cloneDeep(allTags)
            meta.current.rows.unshift({ id: null, tagName: 'Nothing' })
            setRefresh({})
        }
    }, [allTags])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<div className="flex flex-col">
        <CompReactSelect
            menuPlacement="auto"
            staticOptions={meta.current.rows}
            optionLabelName="tagName"
            optionValueName="id"
            ref={null}
            selectedValue={id}
            onChange={handleOnChangeTag}
        />

        {/* Submit Button */}
        <WidgetButtonSubmitFullWidth
            label="Submit"
            className="max-w-96 mt-4"
            onClick={handleOnSubmit}
        />
    </div>)

    function handleOnChangeTag(selectedObject: TagType) {
        meta.current.selectedTagId = selectedObject?.id || null
    }

    async function handleOnSubmit() {
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                xData: {
                    id: catId,
                    tagId: meta.current.selectedTagId || null
                },
                tableName: DatabaseTablesMap.CategoryM
            })
            const loadData = context.CompSyncFusionTreeGrid[DataInstancesMap.productCategories].loadData
            if (loadData) {
                loadData()
            }
            Utils.showHideModalDialogA({ isOpen: false })
        } catch (e: any) {
            console.log(e)
        }
    }

}
type MetaType = {
    rows: TagType[],
    selectedTagId: number | null
}
type TagType = {
    id: number | null
    tagName: string
}