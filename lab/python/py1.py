import sqlite3
conn = sqlite3.connect('testdb.sqlite3')
cursor = conn.cursor()
qry='''
CREATE TABLE Employee (
EmpID INTEGER PRIMARY KEY AUTOINCREMENT,
FIRST_NAME TEXT (20),
LAST_NAME TEXT(20),
AGE INTEGER,
SEX TEXT(1),
INCOME FLOAT
);
'''
try:
    cursor.execute(qry)
    print('Success')
except Exception as e:
    print(e.args[0])
finally:
    conn.close()