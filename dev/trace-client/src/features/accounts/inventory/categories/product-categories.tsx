import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/graphql/maps/graphql-queries-map"
import { Utils } from "../../../../utils/utils"
import { IconPlus } from "../../../../controls/icons/icon-plus"
import _ from "lodash"
import { IconEdit1 } from "../../../../controls/icons/icon-edit1"
import { IconCross } from "../../../../controls/icons/icon-cross"
import { IconTag } from "../../../../controls/icons/icon-tag"
import { IconChangeArrow } from "../../../../controls/icons/icon-change-arrow"
import { ProductCategoriesToolbarButtons } from "./product-categories-toolbar-buttons"
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map"
import { AddRootCategoryModal } from "./actions/add-root-category-modal"
import { AddChildCategoryModal } from "./actions/add-child-category-modal"
import { EditCategoryModal } from "./actions/edit-category-modal"
import { AssociateTagModal } from "./actions/associate-tag-modal"
import { ChangeCatgoryParent } from "./actions/change-category-parent"
import { useEffect } from "react"

export function ProductCategories() {
    const instance: string = DataInstancesMap.productCategories
    const {
        buCode
        , context
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        const loadData = context?.CompSyncFusionTreeGrid[instance]?.loadData
        if (loadData && buCode) {
            loadData()
        }
    }, [buCode])

    return (<CompAccountsContainer>
        <CompSyncFusionTreeGridToolbar
            className="mt-2"
            CustomControl={() => <ProductCategoriesToolbarButtons />}
            title='Product Categories'
            isLastNoOfRows={false}
            instance={instance}
            minWidth="950px"
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            addUniqueKeyToJson={true}
            aggregates={getAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.productCategories}
            graphQlQueryName={GraphQLQueriesMapNames.productCategories}
            // isLoadOnInit={false}
            columns={getColumns()}
            height="calc(100vh - 230px)"
            instance={instance}
            minWidth='1400px'
            treeColumnIndex={0}
        />
    </CompAccountsContainer>)

    function actionHeaderTemplate() {
        return (<div className="flex justify-start items-center h-full">
            <button onClick={handleActionHeaderOnClick}
                className="e-btn flex w-full justify-start font-semibold text-blue-500 items-center rounded-md hover:text-blue-700 hover:bg-blue-50 border-none  focus:bg-blue-50 focus:text-blue-500">
                <IconPlus className="w-4 h-4 mr-2" />
                ADD ROOT CATEGORY
            </button>
        </div>)
        function handleActionHeaderOnClick() {
            Utils.showHideModalDialogA({
                title: "Add Root Category",
                isOpen: true,
                element: <AddRootCategoryModal />,
            })
        }
    }

    function actionTemplate(props: any) {
        const isAddChildButtonVisible: boolean = !props.isLeaf
        const isDelButtonVisible = _.isEmpty(props.children) && (!props.isUsed)

        return (<div className="flex items-center h-full justify-start">

            {/* Add child */}
            {isAddChildButtonVisible && <button onClick={handeleOnClickAddChild} className="flex font-medium justify-center items-center text-xs text-blue-700">
                <IconPlus className="w-3 h-3 mr-1.5" />
                CHILD
            </button>}

            {/* Edit self */}
            {<button onClick={handeleOnClickEditSelf} className="flex font-medium justify-center items-center ml-4 text-xs text-green-700">
                <IconEdit1 className="w-3 h-3 mr-1.5" />
                EDIT
            </button>}

            {/* Change parent */}
            {<button onClick={handeleOnClickChangeParent} className="flex font-medium justify-center items-center ml-4 text-xs text-orange-500">
                <IconChangeArrow className="w-3 h-3 mr-1.5" />
                CHANGE PARENT
            </button>}

            {/* Tag */}
            {<button onClick={handleOnClickTag} className="flex font-medium justify-center items-center ml-4 text-xs text-blue-500">
                <IconTag className="w-3 h-3 mr-1.5" />
                TAG
            </button>}

            {/* Delete */}
            {isDelButtonVisible && <button onClick={handeleOnClickDelete} className="flex font-medium justify-center items-center ml-4 text-xs text-red-700">
                <IconCross className="w-4 h-4 mr-1" />
                DEL
            </button>}
        </div>)

        function handeleOnClickAddChild() {
            Utils.showHideModalDialogA({
                title: `Add child for ${props.catName}`,
                isOpen: true,
                element: <AddChildCategoryModal id={props.id} />,
            })
        }

        function handeleOnClickChangeParent() {
            Utils.showHideModalDialogA({
                title: `Select New Parent for '${props.catName}'`,
                isOpen: true,
                element: <ChangeCatgoryParent catId={props.id} />, // id is tag id
                size: 'md'
            })
        }

        function handeleOnClickEditSelf() {
            Utils.showHideModalDialogA({
                title: `Edit ${props.catName}`,
                isOpen: true,
                element: <EditCategoryModal
                    catName={props.catName}
                    descr={props.descr}
                    hasChildRecords={props.hasChildRecords}
                    id={props.id}
                    isLeaf={props.isLeaf}
                    isUsed={props.isUsed}
                />,
            })
        }

        function handeleOnClickDelete() {
            Utils.showDeleteConfirmDialog(async () => {
                try {
                    await Utils.doGenericDelete({
                        buCode: buCode || '',
                        deletedIds: [props.id],
                        tableName: DatabaseTablesMap.CategoryM
                    })
                    Utils.showSaveMessage()
                    Utils.loadDataInTreeGridWithSavedScrollPos(context, instance)
                } catch (e: any) {
                    console.log(e)
                }
            })
        }

        function handleOnClickTag() {
            Utils.showHideModalDialogA({
                title: 'Associate Tag',
                isOpen: true,
                element: <AssociateTagModal catId={props.id} id={props.tagId || null} />, // id is tag id
            })
        }
    }

    function getAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'catName',
                field: 'catName',
                type: 'Count',
                footerTemplate: (props: any) => `Count: ${props['catName - count']}`,
            }
        ])
    }

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'catName',
                headerText: 'Category name',
                width: 200
            },
            {
                field: '',
                headerTemplate: actionHeaderTemplate,
                template: actionTemplate,
                width: 250,
            },
            {
                field: 'descr',
                headerText: 'Description',
                width: 100
            },
            {
                field: 'tagName',
                headerText: 'Tag',
                width: 50
            },
            {
                field: 'leaf',
                headerText: 'Leaf',
                width: 50,
                template: (args: any) => args.isLeaf ? 'Yes' : 'No'
            },
            {
                field: 'isUsed',
                headerText: 'Used',
                width: 50,
                template: (args: any) => args.isUsed ? 'Yes' : 'No',
                visible: true
            }
        ])
    }
}