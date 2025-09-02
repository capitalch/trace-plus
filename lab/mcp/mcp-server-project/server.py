from mcp.server.fastmcp import FastMCP
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("hello_mcp_server")

mcp_server = FastMCP(name="HelloServer")

@mcp_server.tool(name="hello", description="Returns a simple greeting.")
def hello_tool() -> str:
    """Returns the 'Hello, MCP!' message."""
    logger.info("Executing hello_tool.")
    return "Hello, MCP! Sushant"

def main():
    logger.info("Starting MCP server...")
    mcp_server.run(transport="stdio")

if __name__ == "__main__":
    main()