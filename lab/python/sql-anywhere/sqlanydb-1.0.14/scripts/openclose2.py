import sqlanydb
try: input = raw_input
except NameError: pass
mydsn = "SQL Anywhere 17 Demo"
myuid = input("Enter your user ID: ")
mypwd = input("Enter your password: ")
# Create a connection object
con = sqlanydb.connect( dsn=mydsn, userid=myuid, password=mypwd )
# Close the connection
con.close()
