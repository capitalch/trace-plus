import pandas as pd
from fastapi.responses import Response
import io

mimeMap = {
    'csv': 'text/csv',
    'json': 'application/json',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pdf': 'application/pdf'
}


async def getGstXlsxAsString(fileType: str):
    df = pd.DataFrame({"Name": ["Alice", "Bob"], "Score": [85, 90]})
    output = io.BytesIO()
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    df.to_excel(writer, sheet_name='xyz', index=False)
    writer.close()
    output.seek(0)
    str = output.read()
    output.close()
    return Response(str, media_type=mimeMap.get(fileType),
                    headers={"Content-Disposition": "attachment; filename=report.xlsx"},)
