import Swal from "sweetalert2";
import dayjs from "dayjs";
// import _ from "lodash";
import { RootStateType, store } from "../app/store/store";
import { Messages } from "./messages";
import { ReactElement } from "react";
import { ibukiEmit } from "./ibuki";
import { IbukiMessages } from "./ibukiMessages";
import { getApolloClient } from "../app/graphql/apollo-client";
import {
  AccSettingType,
  BranchType,
  FinYearType,
  LoginType,
  UserDetailsType
} from "../features/login/login-slice";
import {
  GraphQLQueriesMap,
  GraphQLQueriesMapNames,
  GraphQLUpdateArgsType
} from "../app/graphql/maps/graphql-queries-map";
import { showCompAppLoader } from "../controls/redux-components/comp-slice";
import { CompInstances } from "../controls/redux-components/comp-instances";
import { treeGridUtils, TreeGridUtilsType } from "./tree-grid-utils";
import { gridUtils, GridUtilsType } from "./grid-utils";
import { GlobalContextType } from "../app/global-context";
import { TranType, TranTypeMap, TranTypeReverseMap } from "./global-types-interfaces-enums";

export const Utils: UtilsType = {
  addUniqueKeysToJson: addUniqueKeysToJson,
  decodeExtDbParams: decodeExtDbParams,
  doGenericDelete: doGenericDelete,
  doGenericQuery: doGenericQuery,
  doGenericUpdate: doGenericUpdate,
  doGenericUpdateQuery: doGenericUpdateQuery,
  doValidateDebitCreditAndUpdate: doValidateDebitCreditAndUpdate,
  getCompanyName: getCompanyName,
  getCurrentBranch: getCurrentBranch,
  getCurrentDateFormat: getCurrentDateFormat,
  getCurrentFinYearFormattedDateRange: getCurrentFinYearFormattedDateRange,
  getCurrentLoginInfo: getCurrentLoginInfo,
  getDbNameDbParams: getDbNameDbParams,
  getDecimalFormatter: getDecimalFormatter,
  getGeneralSettings: getGeneralSettings,
  getHostUrl: getHostUrl,
  getIntegerFormatter: getIntegerFormatter,
  getReactSelectStyles: getReactSelectStyles,
  getReduxState: getReduxState,
  getRunningFinYear: getRunningFinYear,
  getRunningFinYearId: getRunningFinYearId,
  getToken: getToken,
  getTranTypeId: getTranTypeId,
  getTranTypeName: getTranTypeName,
  getUnitInfo: getUnitInfo,
  getUserDetails: getUserDetails,
  gridUtils: gridUtils,
  getUniqueId: getUniqueId,
  isNotNullOrUndefined: isNotNullOrUndefined,
  isNumeric: isNumeric,
  loadDataInTreeGridWithSavedScrollPos: loadDataInTreeGridWithSavedScrollPos,
  mutateGraphQL: mutateGraphQL,
  queryGraphQL: queryGraphQL,
  showAlertMessage: showAlertMessage,
  showConfirmDialog: showConfirmDialog,
  showCustomMessage: showCustomMessage,
  showDeleteConfirmDialog: showDeleteConfirmDialog,
  showErrorMessage: showErrorMessage,
  showFailureAlertMessage: showFailureAlertMessage,
  showHideModalDialogA: showHideModalDialogA,
  showHideModalDialogB: showHideModalDialogB,
  showGraphQlErrorMessage: showGraphQlErrorMessage,
  showOptionsSelect: showOptionsSelect,
  showSaveMessage: showSaveMessage,
  showSuccessAlertMessage: showSuccessAlertMessage,
  showWarningMessage: showWarningMessage,
  toDecimalFormat: toDecimalFormat,
  toWordsFromAmount: toWordsFromAmount,
  treeGridUtils: treeGridUtils
};

let uniqueId: number = 1

function addUniqueKeysToJson(data: any) {
  // AI created
  let runningKey = 100000; // Start of child series

  const traverseAndAddKeys = (node: any, parentKey: number) => {
    // Mutate the node by adding a pkey
    node.pkey = parentKey;

    // Traverse through child nodes if present
    Object.keys(node).forEach((key) => {
      if (Array.isArray(node[key])) {
        // Mutate children by adding unique running keys
        node[key].forEach((child) => {
          traverseAndAddKeys(child, runningKey++);
        });
      } else if (typeof node[key] === "object" && node[key] !== null) {
        // Mutate nested objects
        traverseAndAddKeys(node[key], runningKey++);
      }
    });
  };

  // Mutate the top-level data array
  data.forEach((item: any, index: number) => {
    const parentKey = index + 1; // Assign a consistent parent key
    traverseAndAddKeys(item, parentKey);
  });

  return data; // Return the mutated data
}

async function decodeExtDbParams(encodedDbParams: string) {
  // const q = GraphQLQueriesMap.decodeExtDbParams(encodedDbParams);
  // const qName = GraphQLQueriesMapNames.decodeExtDbParams;
  try {
    // const res: any = await Utils.queryGraphQL(q, qName);
    // const dbParamsString = res?.data?.[qName];
    // const dbParams: object = JSON.parse(dbParamsString);
    // if (_.isEmpty(dbParams)) {
    //   throw new Error(Messages.errExtDbParamsFormatError);
    // }
    // return dbParams;
    return ({ conn: encodedDbParams })
  } catch (e: any) {
    Utils.showErrorMessage(e);
  }
}

async function doGenericDelete({
  buCode,
  tableName,
  deletedIds
}: DoGenericDeleteType) {
  const userDetails: UserDetailsType = Utils.getUserDetails() || {};
  const { dbName, decodedDbParamsObject } = userDetails;
  const traceDataObject: GraphQLUpdateArgsType = {
    tableName: tableName,
    dbParams: decodedDbParamsObject,
    buCode: buCode,
    deletedIds: deletedIds
  };
  const q: any = GraphQLQueriesMap.genericUpdate(dbName || "", traceDataObject);
  const queryName: string = GraphQLQueriesMapNames.genericUpdate;
  const res: any = await mutateGraphQL(q, queryName);
  return res;
}

async function doGenericQuery({
  buCode,
  dbName,
  dbParams,
  sqlArgs,
  sqlId
}: DoGenericQueryType) {
  const res: any = await queryGraphQL(
    GraphQLQueriesMap.genericQuery(dbName || "", {
      buCode: buCode,
      dbParams: dbParams,
      sqlArgs: sqlArgs,
      sqlId: sqlId
    }),
    GraphQLQueriesMapNames.genericQuery
  );
  return res?.data?.[GraphQLQueriesMapNames.genericQuery];
}

async function doGenericUpdate({
  buCode,
  dbName,
  tableName,
  xData,
  deletedIds
}: DoGenericUpdateType) {
  const userDetails: UserDetailsType = Utils.getUserDetails() || {};
  const { dbName: dbAccounts, decodedDbParamsObject } = userDetails;
  const traceDataObject: GraphQLUpdateArgsType = {
    tableName: tableName,
    dbParams: decodedDbParamsObject,
    xData: xData,
    buCode: buCode,
    deletedIds: deletedIds
  };
  const q: any = GraphQLQueriesMap.genericUpdate(dbName || dbAccounts || "", traceDataObject);
  const queryName: string = GraphQLQueriesMapNames.genericUpdate;
  const res: any = await mutateGraphQL(q, queryName);
  return res;
}

async function doValidateDebitCreditAndUpdate({
  buCode,
  dbName,
  tableName,
  xData,
  deletedIds
}: DoGenericUpdateType) {
  const userDetails: UserDetailsType = Utils.getUserDetails() || {};
  const { dbName: dbAccounts, decodedDbParamsObject } = userDetails;
  const traceDataObject: GraphQLUpdateArgsType = {
    tableName: tableName,
    dbParams: decodedDbParamsObject,
    xData: xData,
    buCode: buCode,
    deletedIds:deletedIds
  };
  const q: any = GraphQLQueriesMap.validateDebitCreditAndUpdate(dbName || dbAccounts || "", traceDataObject);
  const queryName: string = GraphQLQueriesMapNames.validateDebitCreditAndUpdate;
  const res: any = await mutateGraphQL(q, queryName);
  return res;
}

async function doGenericUpdateQuery({
  buCode,
  dbName,
  dbParams,
  sqlArgs,
  sqlId
}: DoGenericUpdateQueryType) {
  const res: any = await mutateGraphQL(
    GraphQLQueriesMap.genericUpdateQuery(dbName || "", {
      buCode: buCode,
      dbParams: dbParams,
      sqlArgs: sqlArgs,
      sqlId: sqlId
    }),
    GraphQLQueriesMapNames.genericUpdateQuery
  );
  return res?.data?.[GraphQLQueriesMapNames.genericUpdateQuery];
}

function getCompanyName(): string {
  const unitInfo: UnitInfoType | undefined = getUnitInfo();
  return unitInfo?.unitName || "";
}

function getCurrentBranch(): BranchType | undefined {
  return getCurrentLoginInfo().currentBranch;
}

function getCurrentDateFormat() {
  const accSettings: AccSettingType[] | undefined =
    getCurrentLoginInfo()?.accSettings;
  const generalSettings: AccSettingType | undefined = accSettings?.find(
    (s: AccSettingType) => s.key === "generalSettings"
  );
  const dateFormat: string = generalSettings?.jData?.dateFormat || "dd/MM/YYYY";
  return dateFormat;
}

function getCurrentFinYearFormattedDateRange() {
  const accSettings: AccSettingType[] | undefined =
    getCurrentLoginInfo()?.accSettings;
  const generalSettings: AccSettingType | undefined = accSettings?.find(
    (s: AccSettingType) => s.key === "generalSettings"
  );
  const dateFormat: string = generalSettings?.jData?.dateFormat || "DD/MM/YYYY";
  const finYear: FinYearType =
    getCurrentLoginInfo().currentFinYear || getRunningFinYear();
  const startDate: string = dayjs(finYear.startDate).format(dateFormat);
  const endDate: string = dayjs(finYear.endDate).format(dateFormat);
  return `${startDate} - ${endDate}`;
}

function getCurrentLoginInfo() {
  const reduxState: RootStateType = store.getState();
  return reduxState.login;
}

function getDbNameDbParams(): DbNameDbParamsType {
  const loginInfo: LoginType = store.getState().login;
  const userDetails: UserDetailsType = loginInfo?.userDetails || {};
  const dbNameDbParams: DbNameDbParamsType = {
    dbName: userDetails.dbName,
    dbParams: userDetails.decodedDbParamsObject
  };
  return dbNameDbParams;
}

function getDecimalFormatter() {
  const formatter: any = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter;
}

function getGeneralSettings(): GeneralSettingsType {
  const accSettings: AccSettingType[] | undefined =
    getCurrentLoginInfo()?.accSettings;
  const accSetting: AccSettingType | undefined = accSettings?.find(
    (s: AccSettingType) => s.key === "generalSettings"
  );
  return accSetting?.jData;
}

function getHostUrl() {
  let url: string;
  if (import.meta.env.DEV) {
    url = import.meta.env["VITE_APP_LOCAL_SERVER_URL"];
  } else {
    url = window.location.origin; // Use this to get the current host URL
  }
  return url;
}

function getIntegerFormatter() {
  const formatter: any = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return formatter;
}

function getReactSelectStyles() {
  return {
    input: (base: any) => ({
      ...base,
      minWidth: "15rem",
      "input:focus": {
        boxShadow: "none"
      }
    }),
    option: (defaultStyles: any) => ({
      ...defaultStyles,
      paddingTop: "4px",
      paddingBottom: "4px",
      paddingLeft: "10px",
      fontSize: "14px"
    })
  };
}

function getReduxState(): RootStateType {
  return store.getState();
}

function getRunningFinYear(): FinYearType {
  const today = dayjs();
  const year: number = today.month() > 3 ? today.year() : today.year() - 1;
  const startDate: string = `${year}-04-01`;
  const endDate: string = `${year + 1}-03-31`;
  return {
    finYearId: year,
    startDate: startDate,
    endDate: endDate
  };
}

function getRunningFinYearId(): number {
  const today = dayjs();
  const year: number = today.month() > 3 ? today.year() : today.year() - 1;
  return year;
}

function getToken() {
  const state: RootStateType = store.getState();
  return state.login.token;
}

function getTranTypeId(tranType: TranType): number | undefined {
  return (TranTypeMap[tranType])
}

function getTranTypeName(tranTypeId: number): TranType | undefined {
  return (TranTypeReverseMap[tranTypeId])
}

function getUnitInfo(): UnitInfoType | undefined {
  const accSettings: AccSettingType[] | undefined =
    getCurrentLoginInfo()?.accSettings;
  const accSetting: AccSettingType | undefined = accSettings?.find(
    (s: AccSettingType) => s.key === "unitInfo"
  );
  return accSetting?.jData;
}

function getUserDetails(): UserDetailsType | undefined {
  return getCurrentLoginInfo().userDetails;
}

function getUniqueId() {
  return (uniqueId++)
}

function isNotNullOrUndefined<T>(value: T | null | undefined): boolean {
  return value !== null && value !== undefined;
}

function isNumeric(value: any): boolean {
  return !isNaN(Number(value));
}

async function loadDataInTreeGridWithSavedScrollPos(
  context: GlobalContextType,
  instance: string
) {
  const loadData = context.CompSyncFusionTreeGrid[instance].loadData;
  const gridRef: any = context?.CompSyncFusionTreeGrid?.[instance]?.gridRef;
  if (gridRef?.current) {
    treeGridUtils.saveScrollPos(context, instance);
  }
  if (loadData) {
    await loadData();
  }
}

async function mutateGraphQL(q: any, queryName: string) {
  try {
    store.dispatch(
      showCompAppLoader({
        instance: CompInstances.compAppLoader,
        isVisible: true
      })
    );
    const client = getApolloClient();
    const result: any = await client.mutate({
      mutation: q
    });
    const error: any = result?.data?.[queryName]?.error?.content;
    if (error) {
      Utils.showGraphQlErrorMessage(error);
      throw error;
    }
    showSaveMessage();
    return result;
  } catch (e: any) {
    console.log(e);
    throw e;
  } finally {
    store.dispatch(
      showCompAppLoader({
        instance: CompInstances.compAppLoader,
        isVisible: false
      })
    );
  }
}

async function queryGraphQL(q: any, queryName: string) {
  try {
    store.dispatch(
      showCompAppLoader({
        instance: CompInstances.compAppLoader,
        isVisible: true
      })
    );
    const client = getApolloClient();
    const result: any = await client.query({
      query: q
    });
    const error: any = result?.data?.[queryName]?.error?.content;
    if (error) {
      Utils.showGraphQlErrorMessage(error);
      throw error;
    }
    return result;
  } finally {
    store.dispatch(
      showCompAppLoader({
        instance: CompInstances.compAppLoader,
        isVisible: false
      })
    );
  }
}

function showAlertMessage(title: string, message: string) {
  Swal.fire({
    title: title,
    text: message,
    icon: "info"
  });
}

function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void
) {
  Swal.fire({
    title: title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, proceed!"
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

function showCustomMessage(title: string) {
  Swal.fire({
    toast: true,
    position: "bottom-right",
    background: "#d0f0c0",
    timer: 5000,
    timerProgressBar: true,
    title: title,
    padding: "10px",
    showConfirmButton: false,
    icon: "success",
    iconColor: "#007f5c",
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
    width: "20rem"
  });
}

function showDeleteConfirmDialog(onConfirm: () => void) {
  Swal.fire({
    title: "Are you sure to delete?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, proceed!"
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

function showErrorMessage(
  error?: any,
  errorCode?: string,
  errorMessage?: string
): void {
  const errCode =
    error?.response?.data?.error_code ||
    errorCode ||
    error?.networkError?.result?.error_code ||
    "";
  const errMessage =
    error?.response?.data?.message ||
    errorMessage ||
    error?.networkError?.result?.message ||
    error?.message ||
    Messages.errUnknown;
  const status =
    error?.response?.status || error?.networkError?.statusCode || 500;
  Swal.fire({
    toast: true,
    position: "bottom-right",
    color: "white",
    background: "red",
    timer: 10000,
    timerProgressBar: true,
    title: `Error ${status}: ${errCode}: ${errMessage}`,
    padding: "10px",
    showConfirmButton: false,
    icon: "error",
    iconColor: "white",
    width: "auto",
    showCloseButton: true,
    allowEscapeKey: true
  });
}

// async function showGetText() {
//   // const ipAPI = "//api.ipify.org?format=json";
//   // const response = await fetch(ipAPI);
//   // const data = await response.json();
//   const inputValue = '';
//   const { value }: { value?: string | undefined } = await Swal.fire({
//     title: "Enter Nesting Level",
//     input: "text",
//     inputLabel: "Nesting level",
//     inputValue,
//     showCancelButton: true,
//     inputValidator: (value) => {
//       if (!value) {
//         return "You need to give nesting level";
//       }
//     }
//   });
//   return (value || '3')
// }

function showGraphQlErrorMessage(error: GraphQlErrorType) {
  Swal.fire({
    toast: true,
    position: "bottom-right",
    color: "white",
    background: "red",
    timer: 50000,
    timerProgressBar: true,
    title: `Error ${error?.status_code}: ${error?.error_code}: ${error?.message}: ${error?.detail}`,
    padding: "10px",
    showConfirmButton: false,
    icon: "error",
    iconColor: "white",
    width: "auto",
    showCloseButton: true,

  });
}

function showHideModalDialogA({
  className,
  isOpen,
  title = "",
  element = <></>,
  size
}: ShowHideModalDialogType) {
  const args: ShowModalDialogMessageArgsType = {
    className: className,
    title: title,
    isOpen: isOpen,
    element: element,
    instanceName: "A",
    size: size
  };
  ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-A"], args);
}

function showHideModalDialogB({
  className,
  isOpen,
  title = "",
  element = <></>,
  size
}: ShowHideModalDialogType) {
  const args: ShowModalDialogMessageArgsType = {
    className: className,
    title: title,
    isOpen: isOpen,
    element: element,
    instanceName: "B",
    size: size
  };
  ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-B"], args);
}

function showOptionsSelect(
  message: string,
  option1: string,
  option2: string,
  action: (result: any) => void
) {
  Swal.fire({
    title: "Select an option",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: option1,
    cancelButtonText: "Cancel",
    showDenyButton: true,
    denyButtonText: option2
  }).then(action);
}

function showSaveMessage() {
  Swal.fire({
    toast: true,
    position: "bottom-right",
    background: "#d0f0c0",
    timer: 5000,
    timerProgressBar: true,
    title: "Operation successful",
    padding: "10px",
    showConfirmButton: false,
    icon: "success",
    iconColor: "#007f5c",
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
    width: "20rem"
  });
}

function showSuccessAlertMessage(
  alertMessage: AlertMessageType,
  callback?: () => void
) {
  Swal.fire({
    title: alertMessage.title,
    text: alertMessage.message,
    icon: "success"
  }).then(() => {
    if (callback) {
      callback();
    }
  });
}

function showFailureAlertMessage(alertMessage: AlertMessageType) {
  Swal.fire({
    title: alertMessage.title,
    text: alertMessage.message,
    icon: "error"
  });
}

function showWarningMessage(
  warningMessage: string
): void {
  Swal.fire({
    toast: true,
    position: "bottom-left",
    color: "white",
    background: "orange",
    timer: 60000,
    timerProgressBar: true,
    title: `Warning: ${warningMessage}`,
    padding: "10px",
    showConfirmButton: false,
    icon: "warning",
    iconColor: "white",
    width: "auto",
    showCloseButton: true,
    allowEscapeKey: true
  });
}

function toDecimalFormat(s: any) {
  s = s ?? "";
  if (s === "") {
    return s;
  }
  if (typeof s !== "string") {
    s = String(s);
  }
  let ret: string = s;
  const v = Number(s);
  if (!isNaN(v)) {
    ret = v.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }
  return ret;
}

function toWordsFromAmount(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWords(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToWords(n % 100) : '');
    return '';
  }

  function convertToWords(n: number): string {
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = Math.floor((n % 1000) / 100);
    const rest = n % 100;

    let words = '';
    if (crore) words += numToWords(crore) + ' Crore ';
    if (lakh) words += numToWords(lakh) + ' Lakh ';
    if (thousand) words += numToWords(thousand) + ' Thousand ';
    if (hundred) words += ones[hundred] + ' Hundred ';
    if (rest) words += (words ? 'and ' : '') + numToWords(rest);
    return words.trim();
  }

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let words = `${convertToWords(integerPart)} Rupees`;
  if (decimalPart > 0) {
    words += ` and ${convertToWords(decimalPart)} Paise`;
  }

  return words + ' Only';
}

type AlertMessageType = {
  title: string;
  message: string;
};

export type GeneralSettingsType = {
  dateFormat: string;
  autoLogoutTimeInMins: number | null;
  auditLockDate: string | null;
  defaultGstRate?: number | null;
};

type GraphQlErrorType = {
  detail: string;
  error_code: string;
  status_code: number;
  message: string;
};

type ShowHideModalDialogType = {
  className?: string;
  isOpen: boolean;
  title?: string | undefined;
  element?: ReactElement;
  size?: "sm" | "md" | "lg" | "xl";
};

type ShowModalDialogMessageArgsType = {
  className?: string;
  title?: string | undefined;
  isOpen: boolean;
  element?: ReactElement;
  instanceName: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export type DbNameDbParamsType = {
  dbName: string | undefined;
  dbParams?: { [key: string]: string | undefined };
};

export type DoGenericDeleteType = {
  buCode: string;
  tableName: string;
  deletedIds: string[] | number[] | (number | string)[];
};

export type DoGenericQueryType = {
  sqlId: string;
  sqlArgs?: {
    [key: string]: any;
  };
  buCode: string;
  dbName: string;
  dbParams?: {
    [key: string]: any;
  };
  instance?: string;
};

export type DoGenericUpdateType = {
  buCode: string;
  dbName?: string;
  tableName?: string;
  xData: Record<string, any>[] | Record<string, any>;
  deletedIds?: number[]
};

export type DoGenericUpdateQueryType = {
  sqlId: string;
  sqlArgs?: {
    [key: string]: any;
  };
  buCode: string;
  dbName: string;
  dbParams?: {
    [key: string]: any;
  };
  instance?: string;
};

export type UnitInfoType = {
  email?: string;
  gstin?: string;
  pin?: string;
  state?: string;
  webSite?: string;
  address1?: string;
  address2?: string;
  unitName?: string;
  landPhone?: string;
  shortName?: string;
  mobileNumber?: string;
};

type UtilsType = {
  addUniqueKeysToJson: (data: any) => any;
  decodeExtDbParams: (encodedDbParams: string) => any;
  doGenericDelete: ({
    buCode,
    tableName,
    deletedIds
  }: DoGenericDeleteType) => any;
  doGenericQuery: ({
    sqlId,
    buCode,
    sqlArgs,
    dbName,
    dbParams
  }: DoGenericQueryType) => any;
  doGenericUpdate: ({ buCode, tableName, xData }: DoGenericUpdateType) => any;
  doGenericUpdateQuery: ({
    sqlId,
    buCode,
    sqlArgs,
    dbName,
    dbParams
  }: DoGenericUpdateQueryType) => any;
  doValidateDebitCreditAndUpdate: ({ buCode, tableName, xData }: DoGenericUpdateType) => any;
  getCompanyName: () => string;
  getCurrentBranch: () => BranchType | undefined;
  getCurrentDateFormat: () => string;
  getCurrentFinYearFormattedDateRange: () => string;
  getCurrentLoginInfo: () => LoginType;
  getDbNameDbParams: () => DbNameDbParamsType;
  getDecimalFormatter: () => any;
  getGeneralSettings: () => GeneralSettingsType;
  getHostUrl: () => string;
  getIntegerFormatter: () => any;
  getReactSelectStyles: () => {
    [key: string]: any;
  };
  getReduxState: () => RootStateType;
  getRunningFinYear: () => FinYearType;
  getRunningFinYearId: () => number;
  getToken: () => string | undefined;
  getTranTypeId: (tranTypeName: TranType) => number | undefined;
  getTranTypeName: (tranTypeId: number) => TranType | undefined;
  getUnitInfo: () => UnitInfoType | undefined;
  getUserDetails: () => UserDetailsType | undefined;
  getUniqueId: () => number;
  gridUtils: GridUtilsType;
  isNotNullOrUndefined: (value: any) => boolean;
  isNumeric: (value: any) => boolean;
  loadDataInTreeGridWithSavedScrollPos: (
    context: GlobalContextType,
    instance: string
  ) => void;
  mutateGraphQL: (q: any, queryName: string) => any;
  queryGraphQL: (q: any, queryName: string) => any;
  showAlertMessage: (title: string, message: string) => void;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
  showCustomMessage: (title: string) => void;
  showDeleteConfirmDialog: (onConfirm: () => void) => void;
  showFailureAlertMessage: (alertMessage: AlertMessageType) => void;
  showSuccessAlertMessage: (
    alertMessage: AlertMessageType,
    callback?: () => void
  ) => void;
  showErrorMessage: (
    error?: any,
    errorCode?: string,
    errorMessage?: string
  ) => void;
  // showGetText: () => any;
  showHideModalDialogA: (options: ShowHideModalDialogType) => void;
  showHideModalDialogB: (options: ShowHideModalDialogType) => void;
  showGraphQlErrorMessage: (error: GraphQlErrorType) => void;
  showOptionsSelect: (
    message: string,
    option1: string,
    option2: string,
    action: (result: any) => void
  ) => void;
  showSaveMessage: () => void;
  showWarningMessage: (warningMessage: string) => void;
  toDecimalFormat: (s: any) => string;
  toWordsFromAmount: (amt: number) => string;
  treeGridUtils: TreeGridUtilsType;
};
