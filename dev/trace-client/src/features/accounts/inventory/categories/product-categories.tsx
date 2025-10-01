import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map"
import { Utils } from "../../../../utils/utils"
import { IconPlus } from "../../../../controls/icons/icon-plus"
import _ from "lodash"
import { IconEdit1 } from "../../../../controls/icons/icon-edit1"
import { IconCross } from "../../../../controls/icons/icon-cross"
import { IconTag } from "../../../../controls/icons/icon-tag"
import { IconChangeArrow } from "../../../../controls/icons/icon-change-arrow"
import { ProductCategoriesToolbarButtons } from "./product-categories-toolbar-buttons"
import { AllTables } from "../../../../app/maps/database-tables-map"
import { AddRootCategoryModal } from "./actions/add-root-category-modal"
import { AddChildCategoryModal } from "./actions/add-child-category-modal"
import { EditCategoryModal } from "./actions/edit-category-modal"
import { AssociateTagModal } from "./actions/associate-tag-modal"
import { ChangeCatgoryParent } from "./actions/change-category-parent"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { AppDispatchType } from "../../../../app/store"
import { setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice"

export function ProductCategories() {
    const dispatch: AppDispatchType = useDispatch()
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

    // Set main title for Product Categories
    useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Product Categories" }));
    }, [dispatch]);

    return (<CompAccountsContainer>
        <CompSyncFusionTreeGridToolbar
            className="mt-2"
            CustomControl={() => <ProductCategoriesToolbarButtons />}
            title=''
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
            columns={getColumns()}
            height="calc(100vh - 228px)"
            instance={instance}
            minWidth='1400px'
            treeColumnIndex={0}
        />
    </CompAccountsContainer>)

    function actionHeaderTemplate() {
        return (<div className="flex items-center justify-start h-full">
            <button onClick={handleActionHeaderOnClick}
                className="flex items-center justify-start w-full font-semibold text-blue-500 border-none rounded-md hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-500 e-btn">
                <IconPlus className="mr-2 w-4 h-4" />
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

        return (<div className="flex items-center justify-start h-full">

            {/* Add child */}
            {isAddChildButtonVisible && <button onClick={handeleOnClickAddChild} className="flex items-center justify-center font-medium text-blue-700 text-xs">
                <IconPlus className="mr-1.5 w-3 h-3" />
                CHILD
            </button>}

            {/* Edit self */}
            {<button onClick={handeleOnClickEditSelf} className="flex items-center justify-center ml-4 font-medium text-green-700 text-xs">
                <IconEdit1 className="mr-1.5 w-3 h-3" />
                EDIT
            </button>}

            {/* Change parent */}
            {<button onClick={handeleOnClickChangeParent} className="flex items-center justify-center ml-4 font-medium text-orange-500 text-xs">
                <IconChangeArrow className="mr-1.5 w-3 h-3" />
                CHANGE PARENT
            </button>}

            {/* Tag */}
            {<button onClick={handleOnClickTag} className="flex items-center justify-center ml-4 font-medium text-blue-500 text-xs">
                <IconTag className="mr-1.5 w-3 h-3" />
                TAG
            </button>}

            {/* Delete */}
            {isDelButtonVisible && <button onClick={handeleOnClickDelete} className="flex items-center justify-center ml-4 font-medium text-red-700 text-xs">
                <IconCross className="mr-1 w-4 h-4" />
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
                        tableName: AllTables.CategoryM.name
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