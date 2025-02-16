from fastapi import status
from urllib.parse import unquote
import json
from app.core.messages import Messages
from app.core.dependencies import AppHttpException
from app.core.export_file_helper import (
    get_csv_response,
    get_csv_files_as_zip_response,
    get_excel_sheet_response,
    get_excel_workbook_response,
    get_json_response,
    get_pdf_response,
    get_pdf_files_as_zip_response,
    ExportFileParams,
    ValueData,
)


def getCsvAsString():
    print("csv")


valuesMap: dict = {
    ("accountsMaster", "json"): {
        "method": get_json_response,
        "sqlId": "get_accounts_master_export",
    },
    ("accountsMaster", "xlsx"): {
        "method": get_excel_sheet_response,
        "sqlId": "get_accounts_master_export",
    },
    ("accountsMaster", "csv"): {
        "method": get_csv_response,
        "sqlId": "get_accounts_master_export",
    },
    ("accountsMaster", "pdf"): {
        "method": get_pdf_response,
        "sqlId": "get_accounts_master_export",
    },
    ###
    ("allVouchers", "json"): {
        "method": get_json_response,
        "sqlId": "get_all_vouchers_export",
    },
    ("allVouchers", "xlsx"): {
        "method": get_excel_sheet_response,
        "sqlId": "get_all_vouchers_export",
    },
    ("allVouchers", "csv"): {
        "method": get_csv_response,
        "sqlId": "get_all_vouchers_export",
    },
    ("allVouchers", "pdf"): {
        "method": get_pdf_response,
        "sqlId": "get_all_vouchers_export",
    },
    ###
    ("contra", "json"): {
        "method": get_json_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 6
    },
    ("contra", "xlsx"): {
        "method": get_excel_sheet_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 6
    },
    ("contra", "csv"): {
        "method": get_csv_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 6
    },
    ("contra", "pdf"): {
        "method": get_pdf_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 6
    },
    ###
    ("journals", "json"): {
        "method": get_json_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 1
    },
    ("journals", "xlsx"): {
        "method": get_excel_sheet_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 1
    },
    ("journals", "csv"): {
        "method": get_csv_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 1
    },
    ("journals", "pdf"): {
        "method": get_pdf_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 1
    },
    ###
    ("payments", "json"): {
        "method": get_json_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 2
    },
    ("payments", "xlsx"): {
        "method": get_excel_sheet_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 2
    },
    ("payments", "csv"): {
        "method": get_csv_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 2
    },
    ("payments", "pdf"): {
        "method": get_pdf_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 2
    },
    ###
    ("receipts", "json"): {
        "method": get_json_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 3
    },
    ("receipts", "xlsx"): {
        "method": get_excel_sheet_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 3
    },
    ("receipts", "csv"): {
        "method": get_csv_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 3
    },
    ("receipts", "pdf"): {
        "method": get_pdf_response,
        "sqlId": "get_all_transactions_export",
        "tranTypeId": 3
    },
    ###
    ("trialBalance", "json"): {
        "method": get_json_response,
        "sqlId": "get_trial_balance",
        "path": "trialBalance",
    },
    ("trialBalance", "xlsx"): {
        "method": get_excel_sheet_response,
        "sqlId": "get_trial_balance",
        "path": "trialBalance",
    },
    ("trialBalance", "csv"): {
        "method": get_csv_response,
        "sqlId": "get_trial_balance",
        "path": "trialBalance",
    },
    ("trialBalance", "pdf"): {
        "method": get_pdf_response,
        "sqlId": "get_trial_balance",
        "path": "trialBalance",
    },
    ###
    ("finalAccounts", "json"): {
        "method": get_json_response,
        "sqlId": "get_balanceSheet_profitLoss",
    },
    ("finalAccounts", "xlsx"): {
        "method": get_excel_workbook_response,
        "sqlId": "get_balanceSheet_profitLoss",
    },
    ("finalAccounts", "csvZip"): {
        "method": get_csv_files_as_zip_response,
        "sqlId": "get_balanceSheet_profitLoss",
    },
    ("finalAccounts", "pdfZip"): {
        "method": get_pdf_files_as_zip_response,
        "sqlId": "get_balanceSheet_profitLoss",
    },
    ###
    ("gst", "json"): {"method": get_json_response, "sqlId": "get_all_gst_reports"},
    ("gst", "xlsx"): {
        "method": get_excel_workbook_response,
        "sqlId": "get_all_gst_reports",
    },
    ("gst", "csvZip"): {
        "method": get_csv_files_as_zip_response,
        "sqlId": "get_all_gst_reports",
    },
    ("gst", "pdfZip"): {
        "method": get_pdf_files_as_zip_response,
        "sqlId": "get_all_gst_reports",
    },
}


async def exportFile(request: ValueData):
    if not request.valueString:
        raise AppHttpException(
            message=Messages.err_empty_value_string_for_export,
            detail=Messages.err_empty_value_string_for_download,
            error_code="E1029",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
    valueString: str = unquote(request.valueString)
    valueDict: ExportFileParams = json.loads(valueString)
    valueDict = ExportFileParams(**valueDict)
    exportName = valueDict.exportName
    fileType = valueDict.fileType
    tranTypeId = valuesMap.get((exportName, fileType)).get("tranTypeId", None)
    valueDict.tranTypeId = tranTypeId
    method = valuesMap.get((exportName, fileType)).get("method")
    sqlId = valuesMap.get((exportName, fileType)).get("sqlId")
    path = valuesMap.get((exportName, fileType)).get("path", None)

    values = await method(fileType, sqlId, valueDict, path=path)
    return values
