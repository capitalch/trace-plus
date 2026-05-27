# Optimize functioning of account-picker-flat
- Analyse thoroughly the vouchers folder and account-picker-flat
- account-picker-flat is only used in vouchers
- This control is not very effecient, especially when there is a large list of nested accounts
- Every time a new instance is drawn, there is a query to db which takes time. Drawing of list in the UI os equally time taking
- When a business unit (bu) is changed then refresh of accounts for the new bu is required. Otherwise when branch or fin year changes, there is no need to refresh the accounts list
- I suggest a change:
  - We store the already retrieved list of accounts  in proper format for different vouchers payment, receipt, contra and journal in some global state like GlobalContext or redux
  - The retrieve method is also available in globalContext
  - When voucher page loads first, then all accounts for different AccountPickerFlat instances are retrieved together in parallel and stored in globalContext or redux
  - When there is new instance of AccountPickerFlat is created, it sets the retrieved data to its list. No need to fetch from db
  - When refresh button of control is clicked then force fetch from db is initiated and new data is binded to control
  - AccountPickerFlat controls properties also need to be changed accordingly
- Check client and server side codes to validate /modify my suggestion. Write your plan to plans/plan.md file
# modifications in plan
- businessContextToggle fires even when finyear or branch changed. We don't want to fetch accounts in this case
# New vouchers implementation
- Existing "All Vouchers" menu item is not working fine. There are severe performance issues.
- Create a new menu item "Voucher Entries" in the item "Vouchers". Create a new folder features/accounts/voucher-entries and place all new implementations in the voucher-entries
- The idea is to create a high performant voucher entry system parallel to existing "All Vouchers"
- Requirements
  - Implement Payment, receip, contra and Journal vouchers
  - Provide the existing functionalities
  - implement Reset, submit for new /Edit and view mode having edit, pdf preview, delete and copy
  - Provide PDF, excel and csv download as at present and search and refresh
  - In view mode show pagination
  - Need to be a good UI
## Ncu upgrade to latest versions
# orig working syncfusion
"@syncfusion/ej2-base": "^31.2.12",
"@syncfusion/ej2-pdf-export": "^31.2.12",
"@syncfusion/ej2-react-buttons": "^31.2.12",
"@syncfusion/ej2-react-dropdowns": "^31.2.12",
"@syncfusion/ej2-react-grids": "^31.2.12",
"@syncfusion/ej2-react-inputs": "^31.2.12",
"@syncfusion/ej2-react-popups": "^31.2.12",
"@syncfusion/ej2-react-splitbuttons": "^31.2.12",
"@syncfusion/ej2-react-treegrid": "^31.2.12",

# latest
"@syncfusion/ej2-base": "^32.1.23",
"@syncfusion/ej2-pdf-export": "^32.1.19",
"@syncfusion/ej2-react-buttons": "^32.1.23",
"@syncfusion/ej2-react-dropdowns": "^32.1.23",
"@syncfusion/ej2-react-grids": "^32.1.23",
"@syncfusion/ej2-react-inputs": "^32.1.22",
"@syncfusion/ej2-react-popups": "^32.1.19",
"@syncfusion/ej2-react-splitbuttons": "^32.1.22",
"@syncfusion/ej2-react-treegrid": "^32.1.22",

# ncu suggested
@syncfusion/ej2-base                ^31.2.12  →  ^32.1.23
@syncfusion/ej2-pdf-export          ^31.2.12  →  ^32.1.19
@syncfusion/ej2-react-buttons       ^31.2.12  →  ^32.1.23
@syncfusion/ej2-react-dropdowns     ^31.2.12  →  ^32.1.23
@syncfusion/ej2-react-grids         ^31.2.12  →  ^32.1.23
@syncfusion/ej2-react-inputs        ^31.2.12  →  ^32.1.22
@syncfusion/ej2-react-popups        ^31.2.12  →  ^32.1.19
@syncfusion/ej2-react-splitbuttons  ^31.2.12  →  ^32.1.22
@syncfusion/ej2-react-treegrid      ^31.2.12  →  ^32.1.22

## startup package.json
"dependencies": {
    "@apollo/client": "^4.0.9",
    "@react-pdf/renderer": "^4.3.1",
    "@reduxjs/toolkit": "^2.10.1",
    "@syncfusion/ej2-base": "^31.2.12",
    "@syncfusion/ej2-pdf-export": "^31.2.12",
    "@syncfusion/ej2-react-buttons": "^31.2.12",
    "@syncfusion/ej2-react-dropdowns": "^31.2.12",
    "@syncfusion/ej2-react-grids": "^31.2.12",
    "@syncfusion/ej2-react-inputs": "^31.2.12",
    "@syncfusion/ej2-react-popups": "^31.2.12",
    "@syncfusion/ej2-react-splitbuttons": "^31.2.12",
    "@syncfusion/ej2-react-treegrid": "^31.2.12",
    "@types/lodash": "^4.17.20",
    "@types/number-to-words": "^1.2.3",
    "@types/qs": "^6.14.0",
    "apollo-link-context": "^1.0.20",
    "axios": "^1.13.2",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "dayjs": "^1.11.19",
    "decimal.js": "^10.6.0",
    "framer-motion": "^12.23.24",
    "graphql": "^16.12.0",
    "jspdf": "^3.0.4",
    "jspdf-autotable": "^5.0.2",
    "lodash": "^4.17.21",
    "lucide-react": "^0.554.0",
    "npm-check-updates": "^19.1.2",
    "number-to-words": "^1.2.4",
    "qs": "^6.14.0",
    "react": "^19.2.0",
    "react-click-away-listener": "^2.4.0",
    "react-dom": "^19.2.0",
    "react-draggable": "^4.5.0",
    "react-hook-form": "^7.66.1",
    "react-number-format": "^5.4.4",
    "react-redux": "^9.2.0",
    "react-responsive": "^10.0.1",
    "react-router-dom": "^7.9.6",
    "react-select": "^5.10.2",
    "react-sliding-pane": "^7.3.0",
    "rxjs": "^7.8.2",
    "sweetalert2": "^11.26.3",
    "url-join": "^5.0.0",
    "use-deep-compare-effect": "^1.8.1"
  },

## ncu suggested one
 @apollo/client                        ^4.0.9  →     ^4.1.2
 @react-pdf/renderer                   ^4.3.1  →     ^4.3.2
 @reduxjs/toolkit                     ^2.10.1  →    ^2.11.2
 
 @syncfusion/ej2-base                ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-pdf-export          ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-react-buttons       ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-react-dropdowns     ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-react-grids         ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-react-inputs        ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-react-popups        ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-react-splitbuttons  ^31.2.12  →   ^32.1.24
 @syncfusion/ej2-react-treegrid      ^31.2.12  →   ^32.1.24
 
 @types/lodash                       ^4.17.20  →   ^4.17.23
 @types/react                         ^19.2.8  →    ^19.2.9
 @typescript-eslint/eslint-plugin     ^8.53.0  →    ^8.53.1
 @typescript-eslint/parser            ^8.53.0  →    ^8.53.1
 axios                                ^1.13.2  →    ^1.13.3
 jspdf                                 ^3.0.4  →     ^4.0.0
 jspdf-autotable                       ^5.0.2  →     ^5.0.7
 lodash                              ^4.17.21  →   ^4.17.23
 npm                                  ^11.7.0  →    ^11.8.0
 npm-check-updates                    ^19.1.2  →    ^19.3.1
 qs                                   ^6.14.0  →    ^6.14.1
 react                                ^19.2.0  →    ^19.2.3
 react-dom                            ^19.2.0  →    ^19.2.3
 react-hook-form                       7.66.0  →     7.71.1
 react-router-dom                      ^7.9.6  →    ^7.13.0
 sweetalert2                         ^11.26.3  →  ^11.26.17
 terser                               ^5.45.0  →    ^5.46.0

