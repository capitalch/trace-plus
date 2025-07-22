import sqlanydb
try: input = raw_input
except NameError: pass
myuid = input("Enter your user ID: ")
mypwd = input("Enter your password: ")
# Create a connection object
con = sqlanydb.connect( userid=myuid, password=mypwd )
# Close the connection
con.close()
