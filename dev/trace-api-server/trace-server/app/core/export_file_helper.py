import pandas as pd
import json
import zipfile
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Any, Optional
from fpdf import FPDF
import io
from app.graphql.db.sql_accounts import SqlAccounts
from app.graphql.db.helpers.psycopg_async_helper import exec_sql


class ExportFileParams(BaseModel):
    branchId: Optional[int] = None  # Allows None values
    buCode: str
    clientId: int
    dateFormat: str
    dbParams: Any
    dbName: str
    endDate: str
    exportName: str
    fileType: str
    finYearId: int
    startDate: str


class ValueData(BaseModel):
    valueString: str | None


mimeMap = {
    "csv": "text/csv",
    "csvZip": "application/zip",
    "json": "application/json",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pdf": "application/pdf",
    "pdfZip": "application/zip",
}


async def getJsonData(sqlId: str, valueDict: ExportFileParams, path: str = None):
    sql = getattr(SqlAccounts, sqlId)
    sqlArgs = {
        "branchId": valueDict.branchId,
        "finYearId": valueDict.finYearId,  # error
        "startDate": valueDict.startDate,
        "endDate": valueDict.endDate,
    }
    res = await exec_sql(
        dbName=valueDict.dbName,
        db_params=valueDict.dbParams,
        schema=valueDict.buCode,
        sql=sql,
        sqlArgs=sqlArgs,
    )
    if res[0].get("jsonResult"):
        res = res[0].get("jsonResult")
    if path:
        res = res.get(path)
    return res


async def get_json_response(
    fileType: str, sqlId: str, valueDict: ExportFileParams, path: str = None
):
    jsonResult = await getJsonData(sqlId, valueDict, path)
    json_str = json.dumps(jsonResult, indent=4)

    # Use BytesIO to store JSON data in memory
    json_bytes = io.BytesIO(json_str.encode("utf-8"))

    return Response(
        content=json_bytes.getvalue(),  # Get byte content
        media_type=mimeMap.get(fileType),
        headers={"Content-Disposition": "attachment;"},
    )


async def get_csv_response(
    fileType: str, sqlId: str, valueDict: ExportFileParams, path: str = None
):
    jsonResult = await getJsonData(sqlId, valueDict, path)
    df = pd.DataFrame(jsonResult)
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)  # Convert DataFrame to CSV
    csv_buffer.seek(0)  # Move to the beginning of the file
    # str = csv_buffer.read()
    str1 = csv_buffer.getvalue()
    csv_buffer.close()
    return Response(
        str1,
        media_type=mimeMap.get(fileType),
        headers={"Content-Disposition": "attachment;"},
    )


async def get_csv_files_as_zip_response(
    fileType: str, sqlId: str, valueDict: ExportFileParams, path: str = None
):
    jsonResult = await getJsonData(sqlId, valueDict, path)
    sheets = list(jsonResult.keys())
    csv_files: dict = {}
    for sheet in sheets:
        data = jsonResult.get(sheet)
        if not isinstance(data, list):
            continue
        df = pd.DataFrame(jsonResult.get(sheet))
        csv_files[sheet] = df

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file_name, df in csv_files.items():
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)  # Convert DataFrame to CSV
            zip_file.writestr(
                f"{file_name}.csv", csv_buffer.getvalue()
            )  # Write CSV data to ZIP
    zip_buffer.seek(0)  # Move to the beginning of the file
    return Response(
        content=zip_buffer.getvalue(),
        media_type=mimeMap.get(fileType),
        headers={"Content-Disposition": "attachment;"},
    )


class PDFWithHeader(FPDF):
    def __init__(self, file_name: str):
        super().__init__(orientation="L", unit="mm", format="A3")  # Landscape, A3
        self.file_name = file_name  # Store file name

    def header(self):
        """Add file name as a header on each page"""
        self.set_font("Arial", "B", 12)
        self.cell(
            0, 10, self.file_name, ln=True, align="C"
        )  # Centered file name header
        self.ln(5)  # Add spacing below header


def create_pdf_from_json(data_list: list, file_name: str) -> bytes:
    """Generate a PDF file from a list of dictionaries with clipped text in columns."""

    if not data_list:
        return b""  # Return empty bytes if no data

    pdf = PDFWithHeader(file_name)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=8)

    # ✅ Extract column names
    columns = list(data_list[0].keys()) if data_list else []
    num_cols = len(columns)

    # ✅ Determine column width dynamically
    page_width = pdf.w - 20  # ✅ Subtract margins
    min_col_width = 30
    max_col_width = 60  # ✅ Prevent columns from being too wide
    col_width = max(min_col_width, min(page_width / num_cols, max_col_width))

    # ✅ Estimate max character length that fits in a column
    avg_char_width = 2.5  # Approximate character width in points
    max_chars = int(col_width / avg_char_width)  # Max characters per cell

    # ✅ Table Header
    pdf.set_fill_color(200, 200, 200)  # Light gray background
    pdf.set_font("Arial", "B", 8)

    for col in columns:
        pdf.cell(col_width, 10, col, border=1, align="C", fill=True)
    pdf.ln()

    # ✅ Table Data (Clipped Text)
    pdf.set_font("Arial", size=8)

    for row in data_list:
        for col in columns:
            value = row.get(col, "")

            if isinstance(value, (int, float)):
                value = f"{value:,.2f}"  # ✅ Format numbers with 2 decimal places
                align = "R"  # ✅ Right-align numbers
            else:
                value = str(value)[:max_chars]  # ✅ Clip text properly
                align = "L"  # ✅ Left-align text

            pdf.cell(col_width, 8, value, border=1, align=align)

        pdf.ln()  # Move to the next row

    return pdf.output(dest="S").encode("latin1")


async def get_pdf_response(
    fileType: str, sqlId: str, valueDict: ExportFileParams, path: str = None
):
    jsonResult = await getJsonData(sqlId, valueDict, path)
    pdf_data = create_pdf_from_json(
        jsonResult or [],
        f"{valueDict.exportName} {valueDict.startDate} to {valueDict.endDate}",
    )
    return Response(
        content=pdf_data,
        media_type=mimeMap.get(fileType),
        headers={"Content-Disposition": "attachment;"},
    )


async def get_pdf_files_as_zip_response(
    fileType: str, sqlId: str, valueDict: ExportFileParams, path: str = None
):
    jsonResult = await getJsonData(sqlId, valueDict, path)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file_name, pdf_content in jsonResult.items():
            if not isinstance(pdf_content, list):
                continue
            pdf_data = create_pdf_from_json(
                pdf_content or [], file_name
            )  # Generate PDF
            if pdf_data:
                zip_file.writestr(f"{file_name}.pdf", pdf_data)  # Write to ZIP

    zip_buffer.seek(0)  # Move to the beginning
    return Response(
        content=zip_buffer.getvalue(),
        media_type=mimeMap.get(fileType),
        headers={"Content-Disposition": "attachment;"},
    )


async def get_excel_sheet_response(
    fileType: str, sqlId: str, valueDict: ExportFileParams, path: str = None
):
    jsonResult = await getJsonData(sqlId, valueDict, path)

    output = io.BytesIO()
    writer = pd.ExcelWriter(output, engine="xlsxwriter")
    df = pd.DataFrame(jsonResult)
    df.to_excel(writer, index=False, header=True, startrow=2)
    sheetObj = writer.sheets["Sheet1"]
    sheetObj.write(
        "A1",
        f"Report {valueDict.exportName}: from {valueDict.startDate or ''} to {valueDict.endDate or ''}",
    )
    writer.close()
    output.seek(0)
    str = output.read()
    output.close()
    return Response(
        str,
        media_type=mimeMap.get(fileType),
        headers={"Content-Disposition": "attachment;"},
    )


async def get_excel_workbook_response(
    fileType: str, sqlId: str, valueDict: ExportFileParams, path: str = None
):
    jsonResult = await getJsonData(sqlId, valueDict, path)
    sheets = list(jsonResult.keys())
    output = io.BytesIO()
    writer = pd.ExcelWriter(output, engine="xlsxwriter")
    for sheet in sheets:
        data = jsonResult.get(sheet)
        if not isinstance(data, list):
            continue
        df = pd.DataFrame(jsonResult.get(sheet))
        df.to_excel(writer, sheet_name=sheet, index=False, header=True, startrow=2)
        sheetObj = writer.sheets[sheet]
        sheetObj.write(
            "A1",
            f"Report {valueDict.exportName}: {sheet}: from {valueDict.startDate or ''} to {valueDict.endDate or ''}",
        )
    writer.close()
    output.seek(0)
    str = output.read()
    output.close()

    return Response(
        str,
        media_type=mimeMap.get(fileType),
        headers={"Content-Disposition": "attachment;"},
    )
