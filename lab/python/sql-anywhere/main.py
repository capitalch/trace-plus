import pyodbc
conn_str = (
    "DRIVER={SQL Anywhere 11};"
    "UID=dba;"
    "PWD=sql;"
    "DBN=capi2021;"
    "ENG=server;"
    "HOST=127.0.0.1:2638"
)
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()
cursor.execute("SELECT * FROM acc_main")
for row in cursor.fetchall():
    print(row)