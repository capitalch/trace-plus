class Config:
    PACKAGE_NAME = 'Trace+ accounting'
    DB_PORT = 11085
    DB_PASSWORD = 'KXKdms69217'
    DB_HOST = {
        'development': {
            'host': 'node150483-trace-link.cloudjiffy.net',
            'port': 11085,
        },
        'production': {
            'host': '192.168.14.20',
            'port': 5432,
        },
        'staging': {
            'host': '192.168.14.20',
            'port': 5432,
        }
    }

def get_host_port():
    env = 'development'  # Change to 'production' or 'staging' as needed
    dbConfig = Config.DB_HOST.get(env,'')
    port = dbConfig.get('port', 5432)
    host = dbConfig.get('host', 'localhost')
    return (host, port)

env = 'development'  # Change to 'production' or 'staging' as needed
dbConfig = Config.DB_HOST.get(env,'development')
host1 = dbConfig.get('host', 'localhost')
port1 = dbConfig.get('port', 11085)
# host, port = get_host_port()
host =get_host_port()[0]
port = get_host_port()[1]
print(f"Connecting to database at {host}:{port} for {Config.PACKAGE_NAME}")
# Example usage of the Config class
