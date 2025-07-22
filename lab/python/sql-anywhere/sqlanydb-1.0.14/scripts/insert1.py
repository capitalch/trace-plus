import sqlanydb
try: input = raw_input
except NameError: pass
myuid = input("Enter your user ID: ")
mypwd = input("Enter your password: ")
# Create a connection object, then use it to create a cursor
con = sqlanydb.connect( userid=myuid, pwd=mypwd )
cursor = con.cursor()
cursor.execute("DELETE FROM Customers WHERE ID > 800")

rows = ((801,'Alex','Alt','5 Blue Ave','New York','NY',
        'USA','10012','5185553434','BXM'),
        (802,'Zach','Zed','82 Fair St','New York','NY',
        'USA','10033','5185552234','Zap'))

# Set up a SQL INSERT
parms = ("'%s'," * len(rows[0]))[:-1]
sql = "INSERT INTO Customers VALUES (%s)" % (parms)
print( sql % rows[0] )
cursor.execute(sql % rows[0]) 
print( sql % rows[1] )
cursor.execute(sql % rows[1])
con.commit()
sql = "SELECT * FROM Customers WHERE ID > 800" 
cursor.execute(sql)

# Get a cursor description which contains column names
desc = cursor.description
print( "Number of columns %d" % (len(desc)) )

# Fetch all results from the cursor into a sequence, 
# display the values as column name=value pairs,
# and then close the connection
rowset = cursor.fetchall()
for row in rowset:
    for col in range(len(desc)):
        print( "%s=%s" % (desc[col][0], row[col] ) )
    print()
cursor.close()
con.close()
