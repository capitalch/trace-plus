import { useSelector } from "react-redux";
import { RootStateType } from "../../app/store";
import { SecuredControlType } from "../login/login-slice";
import { MenuItemType } from "./layouts-slice";
import { MasterMenuData, MenuDataItemType } from "./master-menu-data";

/**
 * Hook to filter menu items based on user permissions
 * @param menuType - The type of menu to filter ('accounts' | 'admin' | 'superAdmin')
 * @returns Filtered array of menu items
 */
export const useFilteredMenu = (
  menuType: MenuItemType
): MenuDataItemType[] => {
  const userSecuredControls = useSelector(
    (state: RootStateType) => state.login.userSecuredControls
  );
  const userType = useSelector(
    (state: RootStateType) => state.login.userDetails?.userType
  );

  const menuData = MasterMenuData[menuType];

  // IMPORTANT: No filtering for admin/superAdmin menu types
  if (menuType === 'admin' || menuType === 'superAdmin') {
    return menuData;
  }

  // IMPORTANT: No filtering for Admin (A) and SuperAdmin (S) user types
  // These users should see all menu items regardless of permissions
  if (userType === 'A' || userType === 'S') {
    return menuData;
  }

  // Filter Accounts menu based on permissions for Business (B) users
  return menuData
    .map(parent => filterParentItem(parent, userSecuredControls))
    .filter(parent => parent !== null) as MenuDataItemType[];
};

/**
 * Filter a parent menu item and its children based on permissions
 * @param parent - The parent menu item to filter
 * @param userControls - User's secured controls/permissions
 * @returns Filtered parent item or null if should be hidden
 */
function filterParentItem(
  parent: MenuDataItemType,
  userControls: SecuredControlType[] | undefined
): MenuDataItemType | null {
  const hasParentPermission = checkPermission(parent.controlName, userControls);

  // Filter children
  const filteredChildren = parent.children.filter(child =>
    checkPermission(child.controlName, userControls)
  );

  // Decision logic:
  // 1. Parent has permission + has accessible children → Show parent with children
  // 2. Parent has permission + no children → Show parent only (if has direct path)
  // 3. No parent permission + has accessible children → Show parent with children
  // 4. No parent permission + no accessible children → Hide completely

  if (hasParentPermission || filteredChildren.length > 0) {
    return {
      ...parent,
      children: filteredChildren
    };
  }

  return null;
}

/**
 * Check if user has permission for a specific control
 * @param controlName - The control name to check
 * @param userControls - User's secured controls/permissions
 * @returns true if user has permission, false otherwise
 */
function checkPermission(
  controlName: string | undefined,
  userControls: SecuredControlType[] | undefined
): boolean {
  if (!controlName) return true; // No controlName = no restriction
  return userControls?.some(c => c.controlName === controlName) ?? false;
}
