from pydantic import BaseModel


def exportBSXlsx(finYearId: int):
    print(finYearId)
    pass


def exportPLXlsx(finYearId: int):
    print(finYearId)
    pass


myDict1: dict = {
    ('BS', 'XLSX'): {'method': exportBSXlsx, 'params': 2024},
    ('PL', 'XLSX'): {'method': exportPLXlsx, 'params': 2023},
}

res1: dict = myDict1.get(('BS', 'XLSX'))
method = res1.get('method')
params = res1.get('params')
method(params)


class DownloadFileParams(BaseModel):
    branchId: int
    buCode: str


params: DownloadFileParams = DownloadFileParams(branchId=1, buCode='123')
(branchId, buCode) = vars(params).values()
print(branchId)
