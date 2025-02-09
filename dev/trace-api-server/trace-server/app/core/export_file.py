

from fastapi import status
from pydantic import BaseModel
from typing import Any
from urllib.parse import unquote

import json
from app.core.messages import Messages
from app.core.dependencies import AppHttpException
from app.core.export_file_helper import getGstXlsxAsString

class ExportFileParams(BaseModel):
    branchId: int
    buCode: str
    clientId: int
    dateFormat: str
    dbParams: Any
    dbName: str
    exportName: str
    fileType: str
    finYearId: int


class ValueData(BaseModel):
    valueString: str | None


def getCsvAsString():
    print('csv')


valuesMap: dict = {
    ('accountsMaster', 'csv'): {
        'method': getCsvAsString,
        'sqlKey': 'get_accounts_master'
    },
    ('gst', 'xlsx'): {
        'method': getGstXlsxAsString,
        'sqlKey': 'get_all_gst_reports'
    }
}


async def exportFile(request: ValueData):
    if (not request.valueString):
        raise AppHttpException(message=Messages.err_empty_value_string_for_export, detail=Messages.err_empty_value_string_for_download,
                               error_code='E1029', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    valueString: ExportFileParams = unquote(request.valueString)
    valueDict: dict = json.loads(valueString)
    # python destructure for dict
    branchId, buCode, clientId, dateFormat, dbParams, dbName, exportName, fileType, finYearId = valueDict.values()
    method = valuesMap.get((exportName, fileType)).get('method')
    values = await method(fileType)
    return (values)
