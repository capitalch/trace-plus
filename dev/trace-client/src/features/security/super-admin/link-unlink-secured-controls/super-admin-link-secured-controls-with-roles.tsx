import { useContext, useEffect, useState } from "react";
import _ from 'lodash'
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Messages } from "../../../../utils/messages";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { IconSecuredControls } from "../../../../controls/icons/icon-secured-controls";
import { IconRoles } from "../../../../controls/icons/icon-roles";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { IconControls } from "../../../../controls/icons/icon-controls";
import { SuperAdminLinkSecuredControlWithRoleModal } from "./super-admin-link-secured-control-with-role-modal";
import { AllTables } from "../../../../app/maps/database-tables-map";

export function SuperAdminLinkSecuredControlsWithRoles() {
    const securedControlsInstance: string = DataInstancesMap.securedControls
    const linksInstance: string = DataInstancesMap.securedControlsLinkRoles
    const context: GlobalContextType = useContext(GlobalContext);
    const [selectedCount, setSelectedCount] = useState<number>(0);
    const [allGroupsExpanded, setAllGroupsExpanded] = useState<boolean>(false);

    useEffect(() => {
        const loadDataLinks = context.CompSyncFusionTreeGrid[linksInstance].loadData
        if (loadDataLinks) {
            loadDataLinks()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ESC key listener to cancel drag operations
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
                if (gridRef?.current) {
                    // Check if actually dragging
                    const isDragging = document.querySelector('.e-cloneproperties');
                    if (isDragging) {
                        gridRef.current.clearSelection();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Track selection changes
    useEffect(() => {
        const updateSelectionCount = () => {
            const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
            if (gridRef?.current) {
                const selected = gridRef.current.getSelectedRecords();
                setSelectedCount(selected.length);

                // Update group caption badges via DOM manipulation
                updateGroupCaptionBadges();
            }
        };

        // Update immediately
        updateSelectionCount();

        // Poll for changes (SyncFusion doesn't always fire events reliably)
        const interval = setInterval(updateSelectionCount, 300);

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className='flex flex-col px-8'>
            {/* Page Header */}
            <div className='mb-6 mt-6'>
                <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-3'>
                        <IconLink className='w-8 h-8 text-primary-400' />
                        <h1 className="font-bold text-primary-400 text-2xl">Linking of Secured Controls with Roles</h1>
                    </div>
                    {/* Keyboard Shortcuts Hint */}
                    <div className='hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md'>
                        <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                        </svg>
                        <span className='text-xs text-gray-600'>
                            <kbd className='px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-semibold'>Tab</kbd> to navigate
                        </span>
                    </div>
                </div>
                <p className='text-gray-700 text-sm ml-11'>Manage role-based access by linking secured controls to specific roles. Drag controls from the left panel and drop them onto roles in the right panel.</p>
            </div>

            <div className='flex gap-6 flex-wrap lg:flex-nowrap'>
                {/* Source Grid - Secured Controls */}
                <div className='flex flex-col flex-1 min-w-[400px] bg-white rounded-lg border border-gray-200 shadow-sm'>
                    {/* Section Header */}
                    <div className='flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200 bg-linear-to-r from-blue-50/50 to-transparent'>
                        <div className='flex items-center gap-2'>
                            <div className='p-1.5 bg-blue-100 rounded-md'>
                                <IconSecuredControls className='w-5 h-5 text-blue-700' />
                            </div>
                            <h2 className='font-semibold text-gray-900 text-base'>Available Secured Controls</h2>
                            <label className='font-medium text-blue-800 text-sm leading-relaxed'>(Drag from here)</label>
                        </div>
                    </div>

                    <div className='px-4 pt-3 pb-2'>
                        <div className='flex items-center justify-between gap-4'>
                            <SelectionIndicator />
                            <div className='flex-1'>
                                <CompSyncFusionGridToolbar
                                    minWidth='400px'
                                    title=''
                                    isLastNoOfRows={false}
                                    instance={securedControlsInstance}
                                    CustomControl={ExpandCollapseButton}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='px-4'>
                        <CompSyncFusionGrid
                            aggregates={getSecuredControlsAggregates()}
                            allowGrouping={true}
                            columns={getSecuredControlsColumns()}
                            gridDragAndDropSettings={
                                {
                                    allowRowDragAndDrop: true,
                                    onRowDragStart: onRowDragStart,
                                    onRowDrop: onSecuredControlsRowDrop,
                                    selectionType: 'Multiple',
                                    targetId: linksInstance
                                }}
                            groupSettings={{
                                columns: ['controlType', 'controlPrefix'],
                                showDropArea: false,
                                showGroupedColumn: false,
                                captionTemplate: multiLevelGroupCaptionTemplate
                            }}
                            hasCheckBoxSelection={true}
                            height="calc(100vh - 355px)"
                            instance={securedControlsInstance}
                            minWidth='400px'
                            rowHeight={40}
                            sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, noOfRows: null }}
                            sqlId={SqlIdsMap.allSecuredControls}
                        />
                    </div>
                </div>

                {/* Target Grid - Roles with Links */}
                <div className='flex flex-col flex-1 min-w-[400px] bg-white rounded-lg border border-gray-200 shadow-sm'>
                    {/* Section Header */}
                    <div className='flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200 bg-linear-to-r from-amber-50/50 to-transparent'>
                        <div className='flex items-center gap-2'>
                            <div className='p-1.5 bg-amber-100 rounded-md'>
                                <IconRoles className='w-5 h-5 text-amber-700' />
                            </div>
                            <h2 className='font-semibold text-gray-900 text-base'>Roles & Linked Controls</h2>
                            <label className='font-medium text-amber-800 text-sm leading-relaxed'>(Drop the dragged controls here)</label>
                        </div>
                    </div>

                    <div className='px-4 pt-3'>
                        <CompSyncFusionTreeGridToolbar
                            instance={linksInstance}
                            title=''
                        />
                    </div>
                    <div className='px-4'>
                        <CompSyncfusionTreeGrid
                            addUniqueKeyToJson={true}
                            className=''
                            childMapping="securedControls"
                            columns={getLinkColumns()}
                            height="calc(100vh - 335px)"
                            instance={linksInstance}
                            minWidth='400px'
                            pageSize={11}
                            rowHeight={40}
                            sqlArgs={{}}
                            sqlId={SqlIdsMap.getRolesSecuredControlsLink}
                            treeColumnIndex={0}
                        />
                    </div>
                </div>
            </div>
        </div>)

    function SelectionIndicator() {
        if (selectedCount === 0) {
            return null; // Hide when nothing selected
        }

        return (
            <div className='flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md shadow-sm'>
                <svg className='w-4 h-4 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                <span className='text-sm font-semibold text-blue-800'>
                    {selectedCount} {selectedCount === 1 ? 'control' : 'controls'} selected
                </span>
                <button
                    onClick={handleClearSelection}
                    className='ml-1 px-2 py-0.5 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors'
                    title='Clear selection'
                >
                    Clear
                </button>
            </div>
        );
    }

    function ExpandCollapseButton() {
        return (
            <button
                onClick={handleToggleAllGroups}
                className='w-8 h-8 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors duration-200 flex items-center justify-center'
                title={allGroupsExpanded ? 'Collapse all groups' : 'Expand all groups'}
            >
                {allGroupsExpanded ? (
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' />
                    </svg>
                ) : (
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z' clipRule='evenodd' />
                    </svg>
                )}
            </button>
        );
    }

    function handleClearSelection() {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (gridRef?.current) {
            gridRef.current.clearSelection();
            setSelectedCount(0);
        }
    }

    function handleToggleAllGroups() {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return;

        if (allGroupsExpanded) {
            gridRef.current.groupCollapseAll();
            setAllGroupsExpanded(false);
        } else {
            gridRef.current.groupExpandAll();
            setAllGroupsExpanded(true);
        }
    }

    function onRowDragStart() {
        // Add visual hint that ESC can cancel the drag operation
        setTimeout(() => {
            const dragHelper = document.querySelector('.e-cloneproperties');
            if (dragHelper) {
                const hint = document.createElement('div');
                hint.className = 'text-xs text-gray-600 mt-2 px-2 py-1 bg-yellow-50 rounded border border-yellow-200 shadow-sm';
                hint.innerHTML = '<kbd class="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">ESC</kbd> to cancel';
                dragHelper.appendChild(hint);
            }
        }, 10);
    }

    function getSelectedCountInGroup(field: string, groupKey: string): number {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return 0;

        const selectedRecords = gridRef.current.getSelectedRecords() as any[];

        const selectedInGroup = selectedRecords.filter((record: any) => {
            if (field === 'controlType') {
                return record.controlType === groupKey;
            } else if (field === 'controlPrefix') {
                return record.controlPrefix === groupKey;
            }
            return false;
        });

        return selectedInGroup.length;
    }


    function updateGroupCaptionBadges() {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return;

        const gridElement = gridRef.current.element;
        if (!gridElement) return;

        // Find all group caption cells
        const groupCaptionCells = gridElement.querySelectorAll('.e-groupcaption');

        groupCaptionCells.forEach((cell: Element) => {
            // Try to extract group information from the cell content
            const cellContent = cell.textContent || '';

            // Find the parent div container that has our custom template
            const customContainer = cell.querySelector('.flex.items-center');
            if (!customContainer) return;

            // Determine field and key by looking at the content
            let field = '';
            let key = '';

            if (cellContent.includes('Type:')) {
                field = 'controlType';
                // Extract the type name (after "Type:" and before the count)
                const match = cellContent.match(/Type:\s*([^\d]+)/);
                if (match) key = match[1].trim();
            } else if (cellContent.includes('Prefix:')) {
                field = 'controlPrefix';
                // Extract the prefix name
                const match = cellContent.match(/Prefix:\s*([^\d]+)/);
                if (match) key = match[1].trim();
            }

            if (!field || !key) return;

            // Calculate selected count for this group
            const selectedCount = getSelectedCountInGroup(field, key);

            // Find existing badge
            let badge = customContainer.querySelector('.group-selected-badge') as HTMLElement;

            if (selectedCount > 0) {
                // Create or update badge
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'group-selected-badge inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-xs border';

                    // Add color based on field type
                    if (field === 'controlType') {
                        badge.classList.add('bg-purple-200', 'text-purple-900', 'border-purple-400');
                    } else {
                        badge.classList.add('bg-purple-200', 'text-purple-800', 'border-purple-400');
                    }

                    // Insert after the count badge
                    const countBadges = customContainer.querySelectorAll('span[class*="rounded-full"]');
                    if (countBadges.length > 0) {
                        const lastBadge = countBadges[countBadges.length - 1];
                        lastBadge.parentElement?.insertBefore(badge, lastBadge.nextSibling);
                    }
                }

                if (badge) {
                    badge.textContent = `${selectedCount} sel`;
                    badge.style.display = 'inline-flex';
                }
            } else if (badge) {
                // Hide badge when no selections
                badge.style.display = 'none';
            }
        });
    }

    function handleSelectAllInGroup(groupProps: any) {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;

        if (!gridRef?.current) {
            console.error('Grid ref not available');
            return;
        }

        const grid = gridRef.current;
        const field = groupProps.field;
        const groupKey = groupProps.groupKey || groupProps.key;

        // Get the data source
        const dataSource = grid.dataSource as any[];

        if (!dataSource || !Array.isArray(dataSource)) {
            console.error('Data source not available');
            return;
        }

        // Filter records that belong to this group
        const recordsInGroup = dataSource.filter((record: any) => {
            if (field === 'controlType') {
                return record.controlType === groupKey;
            } else if (field === 'controlPrefix') {
                return record.controlPrefix === groupKey;
            } else if (field === 'controlName') {
                // If grouping by controlName, match the prefix extracted from the name
                const prefix = record.controlName?.split('.')[0];
                return prefix === groupKey;
            }
            return false;
        });

        if (recordsInGroup.length === 0) {
            console.warn('No records found in group');
            return;
        }

        // Get visual row indices by matching records in current view
        const currentViewRecords = grid.getCurrentViewRecords() as any[];
        const visualIndices: number[] = [];

        // Create a Set of record identifiers from the group for fast lookup
        const groupRecordIds = new Set(recordsInGroup.map((r: any) => r.id || r.controlName));

        currentViewRecords.forEach((viewRecord: any, index: number) => {
            // Skip group header rows (they don't have data row properties)
            if (viewRecord.isCaptionRow || viewRecord.isDataRow === false) {
                return;
            }

            // Check if this view record matches any record in our group
            const recordId = viewRecord.id || viewRecord.controlName;
            if (groupRecordIds.has(recordId)) {
                visualIndices.push(index);
            }
        });

        if (visualIndices.length === 0) {
            return;
        }

        // Get currently selected row indices
        const selectedRowIndexes = grid.getSelectedRowIndexes() || [];

        // Check if all records in this group are already selected
        const allSelected = visualIndices.every(index => selectedRowIndexes.includes(index));

        if (allSelected) {
            // Deselect all rows in this group
            const remainingIndices = selectedRowIndexes.filter(
                (index: number) => !visualIndices.includes(index)
            );

            // Clear selection and reselect remaining rows
            grid.clearSelection();
            if (remainingIndices.length > 0) {
                grid.selectRows(remainingIndices);
            }
        } else {
            // Select all rows in this group (merge with existing selection)
            const merged = [...new Set([...selectedRowIndexes, ...visualIndices])];
            grid.selectRows(merged);
        }
    }

    function multiLevelGroupCaptionTemplate(props: any) {
        const typeName = props.groupKey || props.key || props.headerText || props.value || 'Unknown';
        const count = props.count || 0;
        const field = props.field || '';

        // Determine if this is Type or Prefix grouping based on field
        const isTypeGroup = field === 'controlType';

        if (isTypeGroup) {
            // Level 1: Type grouping (Blue theme)
            return (
                <div className='flex items-center gap-3 py-2 px-3 bg-linear-to-r from-blue-50 to-blue-100/50'>
                    <div className='flex items-center gap-2'>
                        <IconControls className='w-5 h-5 text-blue-600' />
                        <span className='text-gray-600 text-xs font-medium uppercase tracking-wide'>Type:</span>
                        <span className='font-bold text-blue-800 text-base'>{typeName}</span>
                    </div>
                    <span className='inline-flex items-center px-2.5 py-0.5 bg-linear-to-r from-blue-200 to-blue-300 text-blue-900 rounded-full font-bold text-xs shadow-sm border border-blue-400'>
                        {count} {count === 1 ? 'control' : 'controls'}
                    </span>
                    {count > 0 && (
                        <button
                            onClick={() => handleSelectAllInGroup(props)}
                            className='ml-auto px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors duration-200 flex items-center gap-1 border border-blue-300 hover:border-blue-400 shadow-sm'
                            title='Click to select/deselect all controls in this type'
                        >
                            <svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                            </svg>
                            Toggle Select
                        </button>
                    )}
                </div>
            );
        } else {
            // Level 2: Prefix grouping (Green theme)
            return (
                <div className='flex items-center gap-2 py-1.5 px-3 ml-6 bg-linear-to-r from-green-50 to-green-100/50 border-l-2 border-green-500'>
                    <div className='flex items-center gap-2'>
                        <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
                        </svg>
                        <span className='text-gray-600 text-xs font-medium'>Prefix:</span>
                        <span className='font-semibold text-green-800 text-sm'>{typeName}</span>
                    </div>
                    <span className='inline-flex items-center px-2 py-0.5 bg-green-200 text-green-800 rounded-full font-semibold text-xs border border-green-400'>
                        {count}
                    </span>
                    {count > 0 && (
                        <button
                            onClick={() => handleSelectAllInGroup(props)}
                            className='ml-auto px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors duration-200 flex items-center gap-1 border border-green-300 hover:border-green-400 shadow-sm'
                            title='Click to select/deselect all controls in this prefix'
                        >
                            <svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                            </svg>
                            Toggle Select
                        </button>
                    )}
                </div>
            );
        }
    }

    function getSecuredControlsAggregates(): SyncFusionGridAggregateType[] {
        return [{
            columnName: 'controlName',
            field: 'controlName',
            type: "Count",
            format: "N0",
            footerTemplate: securedControlsAggrTemplate
        }]
    }

    function getSecuredControlsColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: "controlName",
                headerText: "Control",
                type: "string",
                width: 180,
            },
            {
                field: "controlType",
                headerText: "Type",
                type: "string",
                width: 60,
            },
            {
                field: "descr",
                headerText: "Description",
                type: "string",
            },
            {
                field: "controlPrefix",
                headerText: "",
                type: "string",
                width: 60,
            },
        ]
    }

    function onSecuredControlsRowDrop(args: any) {
        args.cancel = true
        const targetGridRef = context.CompSyncFusionTreeGrid[linksInstance].gridRef
        const sourceGridRef = context.CompSyncFusionGrid[securedControlsInstance].gridRef

        if (sourceGridRef?.current) {
            sourceGridRef.current.refresh()
        }

        // CANCELLATION 1: Dropped back on source grid - silent cancel
        if (args.target.closest(`#${securedControlsInstance}`)) {
            if (sourceGridRef?.current) {
                sourceGridRef.current.clearSelection()
            }
            return
        }

        // CANCELLATION 2: Dropped in empty area - silent cancel
        const targetRow = args?.target.closest('tr');
        if (!targetRow) {
            if (sourceGridRef?.current) {
                sourceGridRef.current.clearSelection()
            }
            return
        }

        // CANCELLATION 3: Dropped on wrong grid
        if (targetGridRef.current?.id === securedControlsInstance) {
            if (sourceGridRef?.current) {
                sourceGridRef.current.clearSelection()
            }
            return
        }

        const rolesLinkViewRecords = targetGridRef.current.getCurrentViewRecords();
        const targetIndex = args.dropIndex;

        const targetRowData = rolesLinkViewRecords[targetIndex];
        setExpandedKeys()
        if (_.isEmpty(targetRowData)) {
            return
        }
        const idsToExclude: string[] = getIdsToExclude() || []
        const sourceIds: string[] = args.data?.map((x: any) => x.id) || []
        proceedToLink()

        function getIdsToExclude() {
            let ctrls: any[] = []
            if (targetRowData?.level === 0) { //dropped on role
                ctrls = targetRowData?.securedControls || []
            } else if (targetRowData?.level === 1) { //dropped on secured control
                const parentIndex = targetRowData?.parentItem?.index
                const parentRowData = rolesLinkViewRecords[parentIndex]
                ctrls = parentRowData?.securedControls || []
            }
            const ids: string[] = ctrls.map((ctrl: any) => ctrl.securedControlId)
            return (ids)
        }

        async function proceedToLink() {
            const roleId = targetRowData.roleId
            const xData: any[] = sourceIds
                .filter((id: string) => !idsToExclude.includes(id))
                .map(x => ({
                    securedControlId: x,
                    roleId: roleId
                }))
            const traceDataObject: TraceDataObjectType = {
                tableName: AllTables.RoleSecuredControlX.name,
                xData
            };

            try {
                if (_.isEmpty(xData)) {
                    Utils.showAlertMessage('Oops!', Messages.messNothingToDo)
                    return
                }
                const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                await Utils.mutateGraphQL(q, queryName);
                context.CompSyncFusionTreeGrid[linksInstance].loadData();
                Utils.showSaveMessage();
                if (sourceGridRef) {
                    sourceGridRef.current.clearSelection() /// clear selection of source grid
                }
            } catch (e: any) {
                console.log(e);
            }
        }

        function setExpandedKeys() {
            // Only expand the key where items are dropped
            const expandedKeys: Set<number> = new Set()
            if (targetRowData.level === 0) {
                expandedKeys.add(targetRowData.pkey)
            }
            if (targetRowData.level === 1) {
                const parentItem = targetRowData.parentItem
                expandedKeys.add(parentItem.pkey)
            }
            context.CompSyncFusionTreeGrid[linksInstance].expandedKeys = expandedKeys
        }

    }

    function securedControlsAggrTemplate(props: any) {
        return (
            <div className='flex items-center gap-2 px-3'>
                <span className="font-semibold text-gray-800 text-sm">Total Controls:</span>
                <span className="inline-flex items-center justify-center min-w-8 px-2.5">
                    {props.Count}
                </span>
            </div>
        );
    }

    function getLinkColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'name',
                headerText: 'Name (Role / Secured control)',
                type: 'string',
                template: nameColumnTemplate,
            },
            {
                field: 'descr',
                headerText: 'Description',
                template: descrColumnTemplate,
                type: 'string'
            },
        ])
    }

    function nameColumnTemplate(props: any) {
        return (<div className="flex items-center">
            {(props.level === 1) && (
                <div className='flex items-center justify-center w-6 h-6 bg-sky-100 rounded'>
                    <IconControls className="w-4 h-4 text-sky-600" />
                </div>
            )}
            <span className={`ml-2 ${props.level === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{props.name}</span>
            {getChildCount(props)}
        </div>)
    }

    function getChildCount(props: any) {
        return (
            <span className='mt-2 ml-2 text-gray-600 text-xs font-medium'> {props?.childRecords ? `(${props.childRecords.length})` : ''} </span>
        )
    }

    function descrColumnTemplate(props: any) {
        return (
            <div className="flex flex-row items-center">
                <span>{props.descr}</span>
                {getLinkOrUnlinkButton(props)}
                {getUnlinkAllButton(props)}
            </div>
        )
    }

    function getLinkOrUnlinkButton(props: any) {
        let ret = null
        if (props.level === 0) {
            ret = <TooltipComponent content={Messages.messLinkSecuredControl}>
                <button
                    onClick={() => handleOnClickLink(props)}
                    className="ml-2 p-1.5 rounded-md hover:bg-blue-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label="Link secured control to role"
                >
                    <IconLink className="w-6 h-6 text-blue-600 hover:text-blue-700 transition-colors duration-200"></IconLink>
                </button>
            </TooltipComponent>
        } else {
            ret = <TooltipComponent content={Messages.messUnlinkSecuredControl}>
                <button
                    onClick={() => handleOnClickUnlink(props)}
                    className="ml-2 p-1.5 rounded-md hover:bg-amber-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                    aria-label="Unlink secured control from role"
                >
                    <IconUnlink className="w-6 h-6 text-amber-600 hover:text-amber-700 transition-colors duration-200"></IconUnlink>
                </button>
            </TooltipComponent>
        }
        return (ret)
    }

    function getUnlinkAllButton(props: any) {
        let ret = <></>
        const isVisible: boolean = (props?.securedControls?.length || 0) > 0
        if ((props.level === 0) && isVisible) {
            ret = <TooltipComponent content={Messages.messUnlinkAllSecuredControl}>
                <button
                    onClick={() => handleOnClickUnlinkAll(props)}
                    className="ml-2 p-1.5 rounded-md hover:bg-amber-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                    aria-label={`Unlink all secured controls from role ${props.name}`}
                >
                    <IconUnlink className="w-6 h-6 text-amber-600 hover:text-amber-700 transition-colors duration-200"></IconUnlink>
                </button>
            </TooltipComponent>
        }
        return (ret)
    }

    function handleOnClickLink(props: any) {
        Utils.showHideModalDialogA({
            title: "Link a secured control with role",
            isOpen: true,
            element: <SuperAdminLinkSecuredControlWithRoleModal roleId={props.roleId} instance={linksInstance} />,
        })
    }

    function handleOnClickUnlink(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureOnUnLinkSecuredControl
            , Messages.messSureOnUnLinkSecuredControlBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: AllTables.RoleSecuredControlX.name,
                    deletedIds: [props.id],
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                    await Utils.mutateGraphQL(q, queryName);
                    await context.CompSyncFusionTreeGrid[linksInstance].loadData();
                    Utils.showCustomMessage(Messages.messSecuredControlsUnlinkSuccess);
                } catch (e: any) {
                    console.log(e)
                }
            }
        )
    }

    function handleOnClickUnlinkAll(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureOnUnLinkAllSecuredControls
            , Messages.messSureOnUnLinkAllSecuredControlsBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: AllTables.RoleSecuredControlX.name,
                    deletedIds: getAllIds(),
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                    await Utils.mutateGraphQL(q, queryName);
                    await context.CompSyncFusionTreeGrid[linksInstance].loadData();
                    Utils.showCustomMessage(Messages.messSecuredControlsUnlinkSuccess);
                } catch (e: any) {
                    console.log(e)
                }
            }
        )

        function getAllIds() {
            const ids: [string] = props?.securedControls?.map((ctrl: any) => ctrl.id) || []
            return (ids)
        }
    }
}