#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const server = new Server(
  {
    name: "viacep-brasil-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "getAddressByCEP",
        description: "Fetches a Brazilian address using a postal code (CEP).",
        inputSchema: {
          type: "object",
          properties: {
            cep: {
              type: "string",
              description: "The 8-digit CEP code.",
            },
          },
          required: ["cep"],
        },
      },
      {
        name: "getCEPByAddress",
        description: "Fetches a list of CEPs based on a Brazilian address.",
        inputSchema: {
          type: "object",
          properties: {
            uf: {
              type: "string",
              description: "The two-letter state code (e.g., SP).",
            },
            cidade: {
              type: "string",
              description: "The city name.",
            },
            logradouro: {
              type: "string",
              description: "The street name.",
            },
          },
          required: ["uf", "cidade", "logradouro"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "getAddressByCEP": {
      const schema = z.object({
        cep: z.string().regex(/^[0-9]{8}$/, "The CEP must have 8 digits."),
      });
      const { cep } = schema.parse(request.params.arguments);

      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) {
        throw new Error("Failed to fetch address from ViaCEP API.");
      }
      const data = await response.json();
      if (data.erro) {
        return {
          content: [{ type: "text", text: "CEP not found." }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    case "getCEPByAddress": {
      const schema = z.object({
        uf: z.string().regex(/^[A-Z]{2}$/, "The UF must be a two-letter state code."),
        cidade: z.string().min(3, "The city must have at least 3 characters."),
        logradouro: z.string().min(3, "The street must have at least 3 characters."),
      });
      const { uf, cidade, logradouro } = schema.parse(request.params.arguments);

      const response = await fetch(`https://viacep.com.br/ws/${uf}/${cidade}/${logradouro}/json/`);
      if (!response.ok) {
        throw new Error("Failed to fetch CEP from ViaCEP API.");
      }
      const data = await response.json();
      if (data.length === 0) {
        return {
          content: [{ type: "text", text: "No CEP found for the given address." }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// Set up the resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "readme://viacep",
        name: "ViaCEP README",
        description: "Documentation for the ViaCEP MCP Server",
        mimeType: "text/markdown",
      }
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  // Handle README resource
  if (uri === "readme://viacep") {
    try {
      const readmePath = path.join(projectRoot, "README.md");
      const content = fs.readFileSync(readmePath, "utf-8");
      
      return {
        contents: [
          {
            uri: "readme://viacep",
            text: content,
            mimeType: "text/markdown",
          }
        ]
      };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read README.md: ${errorMessage}`);
    }
  }

  throw new Error(`Resource not found: ${uri}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
