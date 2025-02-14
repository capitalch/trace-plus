from fastapi import status
from urllib.parse import unquote
import json
from app.core.messages import Messages
from app.core.dependencies import AppHttpException
from app.core.export_file_helper import (
    get_csv_files_as_zip_response,
    get_excel_workbook_response,
    get_json_response,
    get_pdf_files_as_zip_response,
    ExportFileParams,
    ValueData,
)


def getCsvAsString():
    print("csv")


valuesMap: dict = {
    ("accountsMaster", "csv"): {
        "method": getCsvAsString,
        "sqlId": "get_accounts_master",
    },
    ("gst", "json"): {
        "method": get_json_response,
        "sqlId": "get_all_gst_reports"},
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
    method = valuesMap.get((exportName, fileType)).get("method")
    sqlId = valuesMap.get((exportName, fileType)).get("sqlId")
    values = await method(fileType, sqlId, valueDict)
    return values
