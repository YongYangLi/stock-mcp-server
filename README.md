# Stock MCP Server

A MCP server for real-time stock quotes, using Model Context Protocol (MCP).

## Tools

### get-quote
  - Get real-time stock quotes
  - Input:
    - `symbol` (string): Stock symbol (e.g.: sh600000, sz000001)

## Configuration

### Using with Claude Desktop 、 Cline 

Add the following configuration:

```json
{
  "stock": {
    "command": "npx",
    "args": [
      "-y",
      "stock-mcp-server"
    ]
  }
}
```

Alternatively, you can use the node command directly if you have the package installed:

```json
{
  "json": {
    "command": "node",
    "args": [
      "path/to/build/index.js"
    ]
  }
}
```

## Development

### Build from source

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```