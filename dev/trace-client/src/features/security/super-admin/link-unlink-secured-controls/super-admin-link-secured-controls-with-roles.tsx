import { JSX, useContext, useEffect, useMemo, useState } from "react";
import _ from 'lodash'
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store";
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

/**
 * SuperAdminLinkSecuredControlsWithRoles
 *
 * Manages the linking and unlinking of secured controls with roles in a 4-level tree hierarchy:
 * - Level 0: Roles
 * - Level 1: Control Types (action, page, etc.)
 * - Level 2: Control Prefixes (grouped by naming convention)
 * - Level 3: Individual Controls
 *
 * CRITICAL DATA STRUCTURE REQUIREMENT:
 * =====================================
 * DO NOT use "level" as a field name in your data structure.
 * CompSyncfusionTreeGrid reserves "level" internally for hierarchy management.
 * Using "level" in your data will cause hierarchy display failures.
 *
 * SAFE field names to use:
 * - id, name, descr, parentId, pkey, children
 * - roleId, securedControlId, controlType, controlPrefix
 * - Any custom fields except "level"
 *
 * Level identification is done via:
 * - Level 0: parentId === null
 * - Level 1: name starts with "Type:"
 * - Level 2: name starts with "Prefix:"
 * - Level 3: all other nodes (leaf controls)
 *
 * Features:
 * - Link/Unlink controls at all hierarchy levels
 * - Drag & drop to link controls
 * - Count badges showing control totals
 * - Recursive unlink for groups
 */
export function SuperAdminLinkSecuredControlsWithRoles() {
    const securedControlsInstance: string = DataInstancesMap.securedControls
    const linksInstance: string = DataInstancesMap.securedControlsLinkRoles
    const context: GlobalContextType = useContext(GlobalContext);
    const [selectedCount, setSelectedCount] = useState<number>(0);
    const [checkboxUpdateTrigger, setCheckboxUpdateTrigger] = useState<number>(0);
    const [allGroupsExpanded, setAllGroupsExpanded] = useState<boolean>(false);
    const [allTreeGroupsExpanded, setAllTreeGroupsExpanded] = useState<boolean>(false);

    // Get original data from Redux
    const originalTreeData: any = useSelector((state: RootStateType) => {
        return state.queryHelper[linksInstance]?.data?.[0]?.jsonResult
    })

    // Transform data to 4-level hierarchy
    const transformedTreeData = useMemo(() => {
        if (!originalTreeData || !Array.isArray(originalTreeData)) {
            return [];
        }
        return transformTo4LevelHierarchy(originalTreeData);
    }, [originalTreeData]);

    /**
     * Transforms role data from server into a 4-level tree hierarchy.
     *
     * CRITICAL: This function generates data WITHOUT a "level" field, as CompSyncfusionTreeGrid
     * uses "level" internally. Using "level" as a data field will break hierarchy display.
     *
     * Hierarchy structure:
     * - Level 0: Role (identified by parentId === null)
     * - Level 1: Type Group (identified by name starting with "Type:")
     * - Level 2: Prefix Group (identified by name starting with "Prefix:")
     * - Level 3: Control (leaf nodes with securedControlId)
     *
     * @param roles - Array of role objects from server containing securedControls
     * @returns Array of tree-structured role objects with 4-level hierarchy
     */
    function transformTo4LevelHierarchy(roles: any[]): any[] {
        if (!roles || !Array.isArray(roles)) return roles;

        let pkeyCounter = 10000; // Start counter for generated pkeys

        return roles.map((role, roleIndex) => {
            const rolePkey = roleIndex + 1;

            // If no secured controls, return role with empty children
            if (!role.securedControls || !Array.isArray(role.securedControls) || role.securedControls.length === 0) {
                return {
                    id: role.roleId,
                    name: role.name,
                    descr: role.descr || '',
                    parentId: null,
                    pkey: rolePkey,
                    roleId: role.roleId,
                    type: "role",
                    children: [],
                    securedControls: [] // Keep for unlink all functionality
                };
            }

            // Group secured controls by controlType
            const groupedByType = _.groupBy(role.securedControls, 'controlType');

            const typeChildren = Object.entries(groupedByType).map(([controlType, controlsOfType]: [string, any[]]) => {
                const typePkey = pkeyCounter++;

                // Group by controlPrefix within each type
                const groupedByPrefix = _.groupBy(controlsOfType, 'controlPrefix');

                const prefixChildren = Object.entries(groupedByPrefix).map(([controlPrefix, controlsOfPrefix]: [string, any[]]) => {
                    const prefixPkey = pkeyCounter++;

                    // Level 3: Actual controls
                    const controlChildren = controlsOfPrefix.map(control => {
                        const controlPkey = pkeyCounter++;
                        return {
                            id: control.id,
                            name: control.name,
                            descr: control.descr || '',
                            parentId: prefixPkey,
                            pkey: controlPkey,
                            roleId: role.roleId,
                            securedControlId: control.securedControlId,
                            children: []
                        };
                    });

                    // Level 2: Prefix group
                    return {
                        id: prefixPkey,
                        name: `Prefix: ${controlPrefix}`,
                        descr: `${controlsOfPrefix.length} controls`,
                        parentId: typePkey,
                        pkey: prefixPkey,
                        roleId: role.roleId,
                        children: controlChildren
                    };
                });

                // Level 1: Type group
                return {
                    id: typePkey,
                    name: `Type: ${controlType}`,
                    descr: `${controlType} controls`,
                    parentId: rolePkey,
                    pkey: typePkey,
                    roleId: role.roleId,
                    children: prefixChildren
                };
            });

            // Level 0: Role
            return {
                id: role.roleId,
                name: role.name,
                descr: role.descr || '',
                parentId: null,
                pkey: rolePkey,
                roleId: role.roleId,
                type: "role",
                children: typeChildren,
                securedControls: role.securedControls // Keep for unlink all functionality
            };
        });
    }

    useEffect(() => {
        const loadDataLinks = context.CompSyncFusionTreeGrid[linksInstance].loadData
        if (loadDataLinks) {
            loadDataLinks()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Add computed typePrefix field to all data for unique grouping
    useEffect(() => {
        // Set up an interval to check and process data when it arrives
        const intervalId = setInterval(() => {
            const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
            if (!gridRef?.current) return;

            const dataSource = gridRef.current.dataSource as any[];
            if (!dataSource || !Array.isArray(dataSource) || dataSource.length === 0) return;

            // Check if typePrefix already exists (avoid reprocessing)
            if (dataSource[0]?.typePrefix) {
                clearInterval(intervalId);
                return;
            }

            // Add typePrefix field to each record (combines type and prefix)
            const enhancedData = dataSource.map(record => ({
                ...record,
                typePrefix: `${record.controlType}|${record.controlPrefix}`
            }));

            // Update grid data source and refresh to apply grouping
            gridRef.current.dataSource = enhancedData;
            gridRef.current.refresh();

            // Collapse all groups after data is loaded (only if not already expanded by user)
            setTimeout(() => {
                if (gridRef.current && !allGroupsExpanded) {
                    gridRef.current.groupModule?.collapseAll();
                }
            }, 100);

            // Clear interval after successful processing
            clearInterval(intervalId);
        }, 200);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [context.CompSyncFusionGrid, securedControlsInstance, allGroupsExpanded])

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

    // Track selection changes with debounced polling to prevent infinite loop
    useEffect(() => {
        let lastSelectionCount = 0;
        let isUpdating = false;

        const updateSelectionCount = () => {
            // Prevent re-entrant calls
            if (isUpdating) return;

            const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
            if (gridRef?.current) {
                const selected = gridRef.current.getSelectedRecords();
                const currentCount = selected.length;

                // Only update if count actually changed
                if (currentCount !== lastSelectionCount) {
                    isUpdating = true;
                    lastSelectionCount = currentCount;

                    setSelectedCount(currentCount);
                    setCheckboxUpdateTrigger(Date.now());
                    updateGroupCaptionBadges();

                    // Add/remove draggable cursor styling
                    const gridElement = gridRef.current.element;
                    if (gridElement) {
                        if (currentCount > 0) {
                            gridElement.classList.add('has-selection');
                        } else {
                            gridElement.classList.remove('has-selection');
                        }
                    }

                    // Reset flag after state updates complete
                    setTimeout(() => {
                        isUpdating = false;
                    }, 50);
                }
            }
        };

        // Poll with 100ms interval for responsive checkbox updates
        const interval = setInterval(updateSelectionCount, 100);

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Enable drag from anywhere in grid when items are selected
    useEffect(() => {
        // Delay setup to ensure grid is fully rendered
        const setupTimeout = setTimeout(() => {
            const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
            if (!gridRef?.current) return;

            const gridContent = gridRef.current.element?.querySelector('.e-content');
            if (!gridContent) return;

            let isDragging = false;
            let dragStartPos = { x: 0, y: 0 };

            const handleMouseDown = (e: MouseEvent) => {
                // Get selected records
                const selectedRecords = gridRef.current?.getSelectedRecords();
                if (!selectedRecords || selectedRecords.length === 0) return;

                // Ignore clicks on interactive elements
                const target = e.target as HTMLElement;

                // Don't interfere with data rows (let Syncfusion's default drag work)
                if (target.closest('.e-row:not(.e-groupcaptionrow)')) {
                    return;
                }

                // Don't interfere with checkboxes
                if (target.closest('.e-checkbox-wrapper') || target.closest('.e-checkselect')) {
                    return;
                }

                // Don't interfere with group expand/collapse
                if (target.closest('.e-recordplusexpand') || target.closest('.e-recordpluscollapse')) {
                    return;
                }

                // Don't interfere with scrollbars
                if (target.closest('.e-scrollbar')) {
                    return;
                }

                // Don't interfere with toolbar buttons
                if (target.closest('.e-toolbar')) {
                    return;
                }

                // Prevent default text selection
                e.preventDefault();

            // Store start position for drag threshold
            dragStartPos = { x: e.clientX, y: e.clientY };
            isDragging = false;

            // Add mousemove listener to detect drag intent
            const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - dragStartPos.x;
                const dy = moveEvent.clientY - dragStartPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Require 5px movement to start drag (avoids accidental drags)
                if (distance > 5 && !isDragging) {
                    isDragging = true;
                    startCustomDrag(moveEvent, selectedRecords);
                    cleanup();
                }
            };

            const handleMouseUp = () => {
                cleanup();
            };

            const cleanup = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

            gridContent.addEventListener('mousedown', handleMouseDown);

            return () => {
                gridContent.removeEventListener('mousedown', handleMouseDown);
            };
        }, 500); // Wait 500ms for grid to be fully rendered

        return () => {
            clearTimeout(setupTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.CompSyncFusionGrid, securedControlsInstance])

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
                                columns: ['controlType', 'typePrefix'],
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
                        <div className='flex items-center justify-between gap-4'>
                            <div className='flex-1'>
                                <CompSyncFusionTreeGridToolbar
                                    instance={linksInstance}
                                    isExpandCollapseSwitch={false}
                                    title=''
                                    CustomControl={ExpandCollapseTreeButton}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='px-4'>
                        <CompSyncfusionTreeGrid
                            addUniqueKeyToJson={true}
                            className=''
                            childMapping="children"
                            columns={getLinkColumns()}
                            dataSource={transformedTreeData}
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

    // ============================================
    // Custom Drag Handler
    // ============================================

    function startCustomDrag(event: MouseEvent, selectedRecords: any[]) {
        // Prevent text selection during drag
        document.body.classList.add('dragging-active');

        // Create drag helper element
        const dragHelper = document.createElement('div');
        dragHelper.className = 'custom-drag-helper';
        dragHelper.style.position = 'absolute';
        dragHelper.style.zIndex = '10000';
        dragHelper.style.pointerEvents = 'none';

        // Style the drag helper to show what's being dragged
        dragHelper.innerHTML = `
            <div style="
                padding: 12px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                <span>Dragging ${selectedRecords.length} ${selectedRecords.length === 1 ? 'control' : 'controls'}</span>
            </div>
        `;

        document.body.appendChild(dragHelper);

        // Position drag helper at cursor
        const updateDragHelperPosition = (e: MouseEvent) => {
            dragHelper.style.left = `${e.clientX + 10}px`;
            dragHelper.style.top = `${e.clientY + 10}px`;
        };

        updateDragHelperPosition(event);

        // Track current drop target
        let currentDropTarget: Element | null = null;

        const handleDragMove = (e: MouseEvent) => {
            updateDragHelperPosition(e);

            // Find element under cursor (excluding drag helper)
            dragHelper.style.pointerEvents = 'none';
            const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

            // Check if we're over the target tree grid
            const targetGridId = linksInstance;
            const targetGrid = document.getElementById(targetGridId);

            if (targetGrid && targetGrid.contains(elementUnderCursor)) {
                // Highlight valid drop target
                const row = elementUnderCursor?.closest('tr');
                if (row && row !== currentDropTarget) {
                    // Remove highlight from previous target
                    if (currentDropTarget) {
                        currentDropTarget.classList.remove('e-dragstartrow');
                    }
                    // Add highlight to new target
                    row.classList.add('e-dragstartrow');
                    currentDropTarget = row;
                }
            } else {
                // Remove highlight when not over target
                if (currentDropTarget) {
                    currentDropTarget.classList.remove('e-dragstartrow');
                    currentDropTarget = null;
                }
            }
        };

        const handleDragEnd = (e: MouseEvent) => {
            // Remove drag helper
            dragHelper.remove();

            // Restore text selection
            document.body.classList.remove('dragging-active');

            // Remove highlight
            if (currentDropTarget) {
                currentDropTarget.classList.remove('e-dragstartrow');
            }

            // Find drop target
            const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
            const targetRow = elementUnderCursor?.closest('tr');

            if (targetRow) {
                // Get the target tree grid
                const targetGridRef = context.CompSyncFusionTreeGrid[linksInstance]?.gridRef;
                if (targetGridRef?.current) {
                    // Find the row index in the tree grid
                    const rows = targetGridRef.current.grid.getRows();
                    const rowIndex = Array.from(rows).indexOf(targetRow as any);

                    if (rowIndex >= 0) {
                        // Call the existing drop handler with mock args
                        const mockArgs = {
                            cancel: true,
                            data: selectedRecords,
                            dropIndex: rowIndex,
                            target: targetRow
                        };

                        onSecuredControlsRowDrop(mockArgs);
                    }
                }
            } else {
                // Dropped outside valid target - clean up text selection
                setTimeout(() => {
                    if (window.getSelection) {
                        const selection = window.getSelection();
                        if (selection) {
                            selection.removeAllRanges();
                        }
                    }
                }, 0);
            }

            // Remove event listeners
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    }

    // ============================================
    // UI Component Functions
    // ============================================

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

    function ExpandCollapseTreeButton() {
        return (
            <button
                onClick={handleToggleAllTreeGroups}
                className='w-8 h-8 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors duration-200 flex items-center justify-center'
                title={allTreeGroupsExpanded ? 'Collapse all' : 'Expand all'}
            >
                {allTreeGroupsExpanded ? (
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

    // ============================================
    // Event Handlers
    // ============================================

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

    function handleToggleAllTreeGroups() {
        const treeGridRef = context.CompSyncFusionTreeGrid[linksInstance]?.gridRef;
        if (!treeGridRef?.current) return;

        if (allTreeGroupsExpanded) {
            treeGridRef.current.collapseAll();
            setAllTreeGroupsExpanded(false);
        } else {
            treeGridRef.current.expandAll();
            setAllTreeGroupsExpanded(true);
        }
    }

    function onRowDragStart() {
        // Preserve existing selection when dragging from a non-selected row
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (gridRef?.current) {
            const selectedRecords = gridRef.current.getSelectedRecords();

            // If there are already selected records, preserve them
            if (selectedRecords && selectedRecords.length > 0) {
                // Prevent Syncfusion from changing selection
                setTimeout(() => {
                    // Reselect the original records
                    gridRef.current.selectRows(
                        selectedRecords.map((r: any) => {
                            const dataSource = gridRef.current.dataSource as any[];
                            return dataSource.findIndex((item: any) => item.id === r.id);
                        }).filter((index: number) => index >= 0)
                    );
                }, 0);
            }
        }

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

    // ============================================
    // Group Selection Helper Functions
    // ============================================

    function getSelectedCountInGroup(field: string, groupKey: string): number {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return 0;

        const selectedRecords = gridRef.current.getSelectedRecords() as any[];

        const selectedInGroup = selectedRecords.filter((record: any) => {
            if (field === 'controlType') {
                return record.controlType === groupKey;
            } else if (field === 'typePrefix') {
                return record.typePrefix === groupKey;
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
                field = 'typePrefix';
                // Extract the prefix name
                const match = cellContent.match(/Prefix:\s*([^\d]+)/);
                if (match) {
                    const prefixName = match[1].trim();

                    // Find the parent Type group to construct composite key
                    let parentRow = (cell as HTMLElement).closest('tr')?.previousElementSibling;
                    let parentType = '';

                    while (parentRow) {
                        const parentCell = parentRow.querySelector('.e-groupcaption');
                        if (parentCell && parentCell.textContent?.includes('Type:')) {
                            const typeMatch = parentCell.textContent.match(/Type:\s*([^\d]+)/);
                            if (typeMatch) {
                                parentType = typeMatch[1].trim();
                                break;
                            }
                        }
                        parentRow = parentRow.previousElementSibling;
                    }

                    // Construct composite key: "type|prefix"
                    key = parentType ? `${parentType}|${prefixName}` : prefixName;
                }
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
                    badge.textContent = `${selectedCount} selected`;
                    badge.style.display = 'inline-flex';
                }
            } else if (badge) {
                // Hide badge when no selections
                badge.style.display = 'none';
            }
        });
    }

    /**
     * Gets all control IDs from records that belong to a specific group
     */
    function getAllControlIdsFromGroup(groupProps: any): string[] {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return [];

        const grid = gridRef.current;
        const field = groupProps.field;
        const groupKey = groupProps.groupKey || groupProps.key;
        const dataSource = grid.dataSource as any[];

        if (!dataSource || !Array.isArray(dataSource)) return [];

        // Filter records that belong to this group - now using typePrefix for unique identification
        const recordsInGroup = dataSource.filter((record: any) => {
            if (field === 'controlType') {
                return record.controlType === groupKey;
            } else if (field === 'typePrefix') {
                return record.typePrefix === groupKey;
            } else if (field === 'controlName') {
                const prefix = record.controlName?.split('.')[0];
                return prefix === groupKey;
            }
            return false;
        });

        return recordsInGroup.map((r: any) => r.id).filter((id: any) => id != null);
    }

    /**
     * Gets the checkbox state for a group
     * Returns 'checked', 'unchecked', or 'indeterminate'
     */
    function getGroupCheckboxState(groupProps: any): 'checked' | 'unchecked' | 'indeterminate' {
        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return 'unchecked';

        const grid = gridRef.current;
        const controlIds = getAllControlIdsFromGroup(groupProps);

        if (controlIds.length === 0) return 'unchecked';

        // Get selected records
        const selectedRecords = grid.getSelectedRecords() as any[];
        const selectedIds = new Set(selectedRecords.map((r: any) => r.id));

        const selectedCount = controlIds.filter(id => selectedIds.has(id)).length;

        if (selectedCount === 0) return 'unchecked';
        if (selectedCount === controlIds.length) return 'checked';
        return 'indeterminate';
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

        // Filter records that belong to this group - now using typePrefix for unique identification
        const recordsInGroup = dataSource.filter((record: any) => {
            if (field === 'controlType') {
                return record.controlType === groupKey;
            } else if (field === 'typePrefix') {
                return record.typePrefix === groupKey;
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

    /**
     * Checkbox component for group selection
     */
    function GroupCheckbox({ groupProps }: { groupProps: any }) {
        const [state, setState] = useState<'checked' | 'unchecked' | 'indeterminate'>('unchecked');

        // Extract stable values from groupProps to avoid infinite loop
        const groupKey = groupProps.groupKey || groupProps.key;
        const field = groupProps.field;

        useEffect(() => {
            const newState = getGroupCheckboxState(groupProps);
            if (newState !== state) {
                setState(newState);
            }
        }, [selectedCount, checkboxUpdateTrigger, groupKey, field]); // eslint-disable-line react-hooks/exhaustive-deps

        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation();

            // Perform actual grid selection first
            handleSelectAllInGroup(groupProps);

            // Trigger immediate state update
            setTimeout(() => {
                const newState = getGroupCheckboxState(groupProps);
                setState(newState);
            }, 10);
        };

        return (
            <div
                role="checkbox"
                aria-checked={state === 'checked' ? 'true' : state === 'indeterminate' ? 'mixed' : 'false'}
                aria-label={`${state === 'checked' ? 'Unselect' : 'Select'} all controls in ${groupKey}`}
                tabIndex={0}
                title={`${state === 'checked' ? 'Unselect' : 'Select'} all ${groupKey} controls`}
                onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectAllInGroup(groupProps);
                    }
                }}
                className="inline-flex items-center justify-center w-6 h-6 mr-2 border-2 rounded cursor-pointer bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handleClick}
            >
                {state === 'checked' && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <rect x="2" y="2" width="16" height="16" rx="2" fill="currentColor" />
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                            fill="white"
                            strokeWidth="0.5"
                        />
                    </svg>
                )}
                {state === 'unchecked' && (
                    <svg className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 20 20">
                        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                )}
                {state === 'indeterminate' && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <rect x="2" y="2" width="16" height="16" rx="2" fill="currentColor" />
                        <line x1="6" y1="10" x2="14" y2="10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                )}
            </div>
        );
    }

    /**
     * Gets badge showing selected count in a group
     */
    function getSelectedCountBadge(groupProps: any): JSX.Element | null {
        const field = groupProps.field;
        const groupKey = groupProps.groupKey || groupProps.key;

        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return null;

        const dataSource = gridRef.current.dataSource as any[];
        if (!dataSource) return null;

        // Get all records in this group - now using typePrefix for unique identification
        const recordsInGroup = dataSource.filter((record: any) => {
            if (field === 'controlType') {
                return record.controlType === groupKey;
            } else if (field === 'typePrefix') {
                return record.typePrefix === groupKey;
            }
            return false;
        });

        // Get selected records
        const selectedRecords = gridRef.current.getSelectedRecords() as any[];
        const selectedIds = new Set(selectedRecords.map((r: any) => r.id));

        // Count how many in this group are selected
        const selectedInGroup = recordsInGroup.filter(r => selectedIds.has(r.id)).length;

        if (selectedInGroup === 0) return null;

        return (
            <span className='inline-flex items-center px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full text-xs font-semibold border border-purple-400'>
                {selectedInGroup} selected
            </span>
        );
    }

    /**
     * Gets the total count of controls in a Type group (sum of all controls in all prefixes)
     */
    function getTotalControlCountForTypeGroup(groupProps: any): number {
        const field = groupProps.field;
        const groupKey = groupProps.groupKey || groupProps.key;

        if (field !== 'controlType') {
            return groupProps.count || 0;
        }

        const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
        if (!gridRef?.current) return 0;

        const dataSource = gridRef.current.dataSource as any[];
        if (!dataSource) return 0;

        // Count all records with this controlType
        const controlsInType = dataSource.filter((record: any) => {
            return record.controlType === groupKey;
        });

        return controlsInType.length;
    }

    function multiLevelGroupCaptionTemplate(props: any) {
        const rawTypeName = props.groupKey || props.key || props.headerText || props.value || 'Unknown';
        const field = props.field || '';

        // Determine if this is Type or Prefix grouping based on field
        const isTypeGroup = field === 'controlType';

        // For Type groups, count all controls; for Prefix groups, use provided count
        const count = isTypeGroup ? getTotalControlCountForTypeGroup(props) : (props.count || 0);

        if (isTypeGroup) {
            // Level 1: Type grouping (Blue theme) - header only, no checkbox
            return (
                <div className='flex items-center gap-3 py-2 px-3 bg-linear-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-400'>
                    <div className='flex items-center gap-2'>
                        <IconControls className='w-5 h-5 text-blue-600' />
                        <span className='text-gray-600 text-xs font-medium uppercase tracking-wide'>Type:</span>
                        <span className='font-bold text-blue-800 text-base'>{rawTypeName}</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <span className='inline-flex items-center px-2.5 py-0.5 bg-linear-to-r from-blue-200 to-blue-300 text-blue-900 rounded-full font-bold text-xs shadow-sm border border-blue-400'>
                            {count}
                        </span>
                        <span className='text-gray-600 text-xs font-medium'>
                            {count === 1 ? 'control' : 'controls'}
                        </span>
                    </div>
                    {getSelectedCountBadge(props)}
                </div>
            );
        } else {
            // Level 2: Prefix grouping (typePrefix like "menu|vouchers")
            // Extract just the prefix part for display
            const displayName = (rawTypeName && typeof rawTypeName === 'string' && rawTypeName.includes('|'))
                ? rawTypeName.split('|')[1] || rawTypeName
                : rawTypeName;

            // Level 2: Prefix grouping (Green theme) with checkbox and border on the left
            return (
                <div className='flex items-center gap-2 py-1.5 px-3 -ml-3.5 bg-linear-to-r from-green-50 to-green-100/50'>
                    <div className='border-l-2 border-green-500 pl-2 -ml-3'>
                        {count > 0 && <GroupCheckbox groupProps={props} />}
                    </div>
                    <div className='flex items-center gap-2'>
                        <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
                        </svg>
                        <span className='text-gray-600 text-xs font-medium'>Prefix:</span>
                        <span className='font-semibold text-green-800 text-sm'>{displayName}</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <span className='inline-flex items-center px-2 py-0.5 bg-green-200 text-green-800 rounded-full font-semibold text-xs border border-green-400'>
                            {count}
                        </span>
                        <span className='text-gray-600 text-xs font-medium'>
                            {count === 1 ? 'control' : 'controls'}
                        </span>
                    </div>
                    {getSelectedCountBadge(props)}
                </div>
            );
        }
    }

    // ============================================
    // Grid Configuration Functions
    // ============================================

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
                visible: false,
                width: 60,
            },
            {
                field: "typePrefix",
                headerText: "",
                type: "string",
                visible: false,
                width: 0,
            },
        ]
    }

    // ============================================
    // Drag & Drop Functions
    // ============================================

    function onSecuredControlsRowDrop(args: any) {
        args.cancel = true
        const targetGridRef = context.CompSyncFusionTreeGrid[linksInstance].gridRef
        const sourceGridRef = context.CompSyncFusionGrid[securedControlsInstance].gridRef

        // Helper function to clean up drag artifacts without clearing checkbox selection
        const cleanupDragState = () => {
            // Clear text selection that occurs during drag
            // Use setTimeout to allow Syncfusion to complete its drag cleanup first
            setTimeout(() => {
                if (window.getSelection) {
                    const selection = window.getSelection();
                    if (selection) {
                        selection.removeAllRanges();
                    }
                }
            }, 0);
        };

        // CANCELLATION 1: Dropped back on source grid - silent cancel
        // Selection is preserved to allow users to retry the drag operation
        if (args.target.closest(`#${securedControlsInstance}`)) {
            // Clean up drag artifacts, keep checkbox selection intact
            cleanupDragState();
            return
        }

        // CANCELLATION 2: Dropped in empty area - silent cancel
        // Selection is preserved to allow users to retry the drag operation
        const targetRow = args?.target.closest('tr');
        if (!targetRow) {
            // Clean up drag artifacts, keep checkbox selection intact
            cleanupDragState();
            return
        }

        // CANCELLATION 3: Dropped on wrong grid
        // Selection is preserved to allow users to retry the drag operation
        if (targetGridRef.current?.id === securedControlsInstance) {
            // Clean up drag artifacts, keep checkbox selection intact
            cleanupDragState();
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

            // Find the role level data based on where the item was dropped
            let roleData = null;

            if (targetRowData?.level === 0 || targetRowData?.type === "role") {
                // Dropped on role - use target data directly
                roleData = targetRowData;
            } else if (targetRowData?.level === 1 || targetRowData?.type === "controlTypeGroup") {
                // Dropped on control type group - find parent role
                roleData = findParentRole(targetRowData);
            } else if (targetRowData?.level === 2 || targetRowData?.type === "controlPrefixGroup") {
                // Dropped on control prefix group - find parent role
                roleData = findParentRole(targetRowData);
            } else if (targetRowData?.level === 3 || targetRowData?.type === "control") {
                // Dropped on actual control - find parent role
                roleData = findParentRole(targetRowData);
            }

            if (roleData) {
                ctrls = roleData?.securedControls || [];
            }

            const ids: string[] = ctrls.map((ctrl: any) => ctrl.securedControlId)
            return (ids)
        }

        function findParentRole(rowData: any): any {
            // Walk up the tree to find the role (level 0)
            let current = rowData;
            while (current && current.level !== 0 && current.type !== "role") {
                if (current.parentItem) {
                    const parentIndex = current.parentItem.index;
                    current = rolesLinkViewRecords[parentIndex];
                } else {
                    // Try to find by roleId if parentItem is not available
                    const roleId = current.roleId;
                    current = rolesLinkViewRecords.find((r: any) =>
                        (r.level === 0 || r.type === "role") && r.roleId === roleId
                    );
                    break;
                }
            }
            return current;
        }

        async function proceedToLink() {
            // Get roleId from target or find parent role
            let roleId = targetRowData.roleId;
            if (!roleId) {
                const roleData = findParentRole(targetRowData);
                roleId = roleData?.roleId;
            }
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
            // Expand the entire path to where items are dropped
            const expandedKeys: Set<number> = new Set();

            if (targetRowData.level === 0 || targetRowData.type === "role") {
                // Dropped on role - expand just the role
                expandedKeys.add(targetRowData.pkey);
            } else {
                // Dropped on group or control - expand all parents up to and including the role
                let current = targetRowData;

                // Walk up the tree and collect all parent keys
                while (current) {
                    if (current.pkey) {
                        expandedKeys.add(current.pkey);
                    }

                    if (current.level === 0 || current.type === "role") {
                        break; // Reached the root
                    }

                    if (current.parentItem) {
                        const parentIndex = current.parentItem.index;
                        current = rolesLinkViewRecords[parentIndex];
                    } else {
                        break;
                    }
                }
            }

            context.CompSyncFusionTreeGrid[linksInstance].expandedKeys = expandedKeys;
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

    // ============================================
    // Tree Grid Configuration & Template Functions
    // ============================================

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

    /**
     * Determines the hierarchy level of a tree node.
     *
     * Since CompSyncfusionTreeGrid reserves the "level" field internally, we identify
     * levels using parentId and name patterns instead.
     *
     * @param props - Node properties from the tree grid
     * @returns 0=Role, 1=Type Group, 2=Prefix Group, 3=Control
     */
    function getNodeLevel(props: any): number {
        // Check if it's a role (has no parentId or parentId is null)
        if (!props.parentId) return 0;

        // Check name pattern to determine level
        if (props.name?.startsWith('Type:')) return 1;
        if (props.name?.startsWith('Prefix:')) return 2;

        // Otherwise it's a control
        return 3;
    }

    /**
     * Recursively counts all control nodes (level 3) under a given node.
     * Used to display total control count badges at parent levels.
     *
     * @param node - Tree node to count controls under
     * @returns Total number of control nodes (leaf nodes at level 3)
     */
    function getTotalControlCount(node: any): number {
        // Recursively count all control nodes (level 3) under this node
        const childData = node.children || node.childRecords || [];

        if (childData.length === 0) {
            // This is a leaf node - check if it's a control
            const level = getNodeLevel(node);
            return level === 3 ? 1 : 0;
        }

        // Sum up controls from all children
        return childData.reduce((total: number, child: any) => {
            return total + getTotalControlCount(child);
        }, 0);
    }

    function getChildrenCount(props: any) {
        const childData = props.children || props.childRecords || [];
        if (childData.length === 0) return null;

        return (
            <span className='relative top-1 ml-1 text-xs font-medium opacity-75'>
                ({childData.length})
            </span>
        );
    }

    function nameColumnTemplate(props: any) {
        const level = getNodeLevel(props);

        // Level 0: Role
        if (level === 0) {
            // Calculate total number of controls (recursively count all leaf nodes)
            const totalControls = getTotalControlCount(props);

            return (
                <div className="flex items-center gap-2">
                    <span className='font-semibold text-gray-900'>
                        {props.name}
                        {getChildrenCount(props)}
                    </span>
                    {totalControls > 0 && (
                        <>
                            <span className='inline-flex items-center px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full text-xs font-semibold'>
                                {totalControls}
                            </span>
                            <span className='text-gray-800 text-xs'>
                                {totalControls === 1 ? 'control' : 'controls'}
                            </span>
                        </>
                    )}
                </div>
            );
        }

        // Level 1: Type Group
        if (level === 1) {
            // Calculate total controls using helper function
            const totalControls = getTotalControlCount(props);

            return (
                <div className='flex items-center gap-2 py-1 px-2 bg-blue-50 rounded'>
                    <IconControls className='w-4 h-4 text-blue-600' />
                    <span className='font-semibold text-blue-800'>
                        {props.name}
                        {getChildrenCount(props)}
                    </span>
                    {totalControls > 0 && (
                        <>
                            <span className='inline-flex items-center px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold'>
                                {totalControls}
                            </span>
                            <span className='text-blue-800 text-xs'>
                                {totalControls === 1 ? 'control' : 'controls'}
                            </span>
                        </>
                    )}
                </div>
            );
        }

        // Level 2: Prefix Group
        if (level === 2) {
            // Count direct children (controls)
            const childData = props.children || props.childRecords || [];
            const count = childData.length;

            return (
                <div className='flex items-center gap-2 py-1 px-2 ml-4 bg-green-50 rounded'>
                    <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
                    </svg>
                    <span className='font-semibold text-green-800'>{props.name}</span>
                    {count > 0 && (
                        <>
                            <span className='inline-flex items-center px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-semibold'>
                                {count}
                            </span>
                            <span className='text-green-800 text-xs'>
                                {count === 1 ? 'control' : 'controls'}
                            </span>
                        </>
                    )}
                </div>
            );
        }

        // Level 3: Control
        return (
            <div className="flex items-center ml-8">
                <div className='flex items-center justify-center w-6 h-6 bg-sky-100 rounded'>
                    <IconControls className="w-4 h-4 text-sky-600" />
                </div>
                <span className='ml-2 text-gray-700'>{props.name}</span>
            </div>
        );
    }

    function descrColumnTemplate(props: any) {
        const level = getNodeLevel(props);

        // For Type and Prefix groups (level 1 and 2), show only the Unlink button
        if (level === 1 || level === 2) {
            return (
                <div className="flex flex-row items-center">
                    {getLinkOrUnlinkButton(props)}
                </div>
            );
        }

        // For roles and controls, show description and buttons
        return (
            <div className="flex flex-row items-center">
                <span>{props.descr}</span>
                {getLinkOrUnlinkButton(props)}
                {getUnlinkAllButton(props)}
            </div>
        );
    }

    function getLinkOrUnlinkButton(props: any) {
        const level = getNodeLevel(props);

        // For roles (level 0), show only Link button
        // Unlink All button is handled separately by getUnlinkAllButton()
        if (level === 0) {
            return (
                <TooltipComponent content={Messages.messLinkSecuredControl}>
                    <button
                        onClick={() => handleOnClickLink(props)}
                        className="ml-2 p-1.5 rounded-md hover:bg-blue-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        aria-label="Link secured control to role"
                    >
                        <IconLink className="w-6 h-6 text-blue-600 hover:text-blue-700 transition-colors duration-200"></IconLink>
                    </button>
                </TooltipComponent>
            );
        }

        // Unlink button for Type groups (level 1), Prefix groups (level 2), and individual controls (level 3)
        if (level === 1 || level === 2 || level === 3) {
            // For groups (level 1 and 2), check if they have children to unlink
            const hasChildren = level === 1 || level === 2
                ? (props.children?.length > 0 || props.childRecords?.length > 0)
                : true;

            if (!hasChildren && level !== 3) {
                return null; // Don't show button for empty groups
            }

            const tooltipText = level === 3
                ? Messages.messUnlinkSecuredControl
                : `Unlink all controls under this ${level === 1 ? 'type' : 'prefix'} group`;

            return (
                <TooltipComponent content={tooltipText}>
                    <button
                        onClick={() => level === 3 ? handleOnClickUnlink(props) : handleOnClickUnlinkGroup(props)}
                        className="ml-2 p-1.5 rounded-md hover:bg-amber-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                        aria-label={level === 3 ? "Unlink secured control from role" : `Unlink all controls in this group`}
                    >
                        <IconUnlink className="w-6 h-6 text-amber-600 hover:text-amber-700 transition-colors duration-200"></IconUnlink>
                    </button>
                </TooltipComponent>
            );
        }

        return null;
    }

    function getUnlinkAllButton(props: any) {
        const level = getNodeLevel(props);
        const isVisible: boolean = (props?.securedControls?.length || 0) > 0

        if (level === 0 && isVisible) {
            return (
                <TooltipComponent content={Messages.messUnlinkAllSecuredControl}>
                    <button
                        onClick={() => handleOnClickUnlinkAll(props)}
                        className="ml-2 p-1.5 rounded-md hover:bg-amber-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                        aria-label={`Unlink all secured controls from role ${props.name}`}
                    >
                        <IconUnlink className="w-6 h-6 text-amber-600 hover:text-amber-700 transition-colors duration-200"></IconUnlink>
                    </button>
                </TooltipComponent>
            );
        }

        return null;
    }

    // ============================================
    // Link/Unlink Action Handlers
    // ============================================

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

    function handleOnClickUnlinkGroup(props: any) {
        const level = getNodeLevel(props);
        const groupType = level === 0 ? 'role' : level === 1 ? 'type group' : 'prefix group';
        const groupName = props.name;

        // Collect all control IDs under this group/role
        const controlIds = getAllControlIdsFromNode(props);

        if (controlIds.length === 0) {
            Utils.showAlertMessage('No Controls', `This ${groupType} has no controls to unlink.`);
            return;
        }

        const dialogTitle = level === 0
            ? `Unlink all ${controlIds.length} control${controlIds.length > 1 ? 's' : ''}?`
            : `Unlink ${controlIds.length} control${controlIds.length > 1 ? 's' : ''}?`;

        const dialogBody = level === 0
            ? `Are you sure you want to unlink all ${controlIds.length} control(s) from the role "${groupName}"?`
            : `Are you sure you want to unlink all ${controlIds.length} control(s) from the ${groupType} "${groupName}"?`;

        Utils.showConfirmDialog(
            dialogTitle,
            dialogBody,
            async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: AllTables.RoleSecuredControlX.name,
                    deletedIds: controlIds,
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

    function getAllControlIdsFromNode(node: any): string[] {
        const ids: string[] = [];

        // Helper function to recursively collect control IDs
        function collectIds(currentNode: any) {
            const nodeLevel = getNodeLevel(currentNode);

            // If this is a control (level 3), add its ID
            if (nodeLevel === 3 && currentNode.id) {
                ids.push(currentNode.id);
                return;
            }

            // Otherwise, process children
            const children = currentNode.children || currentNode.childRecords || [];
            children.forEach((child: any) => {
                collectIds(child);
            });
        }

        collectIds(node);
        return ids;
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
