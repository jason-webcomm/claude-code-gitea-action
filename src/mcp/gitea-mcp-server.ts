#!/usr/bin/env node
// Gitea API Operations MCP Server
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// Get configuration from environment variables
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const BRANCH_NAME = process.env.BRANCH_NAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITEA_API_URL = process.env.GITEA_API_URL || "https://api.github.com";

console.log(`[GITEA-MCP] Starting Gitea API Operations MCP Server`);
console.log(`[GITEA-MCP] REPO_OWNER: ${REPO_OWNER}`);
console.log(`[GITEA-MCP] REPO_NAME: ${REPO_NAME}`);
console.log(`[GITEA-MCP] BRANCH_NAME: ${BRANCH_NAME}`);
console.log(`[GITEA-MCP] GITEA_API_URL: ${GITEA_API_URL}`);
console.log(`[GITEA-MCP] GITHUB_TOKEN: ${GITHUB_TOKEN ? "***" : "undefined"}`);

if (!REPO_OWNER || !REPO_NAME || !GITHUB_TOKEN) {
  console.error(
    "[GITEA-MCP] Error: REPO_OWNER, REPO_NAME, and GITHUB_TOKEN environment variables are required",
  );
  process.exit(1);
}

const server = new McpServer({
  name: "Gitea API Operations Server",
  version: "0.0.1",
});

// Helper function to make authenticated requests to Gitea API
async function giteaRequest(
  endpoint: string,
  method: string = "GET",
  body?: any,
): Promise<any> {
  const url = `${GITEA_API_URL}${endpoint}`;
  console.log(`[GITEA-MCP] Making ${method} request to: ${url}`);

  const headers: Record<string, string> = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/json",
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  console.log(`[GITEA-MCP] Response status: ${response.status}`);
  console.log(`[GITEA-MCP] Response: ${responseText.substring(0, 500)}...`);

  if (!response.ok) {
    throw new Error(
      `Gitea API request failed: ${response.status} ${responseText}`,
    );
  }

  return responseText ? JSON.parse(responseText) : null;
}

// Get issue details
server.tool(
  "get_issue",
  "Get details of a specific issue",
  {
    issue_number: z.number().describe("The issue number to fetch"),
  },
  async ({ issue_number }) => {
    try {
      const issue = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issue_number}`,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(issue, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error getting issue: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error getting issue: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Get issue comments
server.tool(
  "get_issue_comments",
  "Get comments for a specific issue",
  {
    issue_number: z.number().describe("The issue number to fetch comments for"),
  },
  async ({ issue_number }) => {
    try {
      const comments = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issue_number}/comments`,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(comments, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error getting issue comments: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error getting issue comments: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Create issue comment
server.tool(
  "create_issue_comment",
  "Create a comment on an issue",
  {
    issue_number: z.number().describe("The issue number to comment on"),
    body: z.string().describe("The comment body"),
  },
  async ({ issue_number, body }) => {
    try {
      const comment = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issue_number}/comments`,
        "POST",
        { body },
      );

      return {
        content: [
          {
            type: "text",
            text: `Comment created successfully: ${JSON.stringify(comment, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error creating issue comment: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error creating issue comment: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Update issue comment
server.tool(
  "update_issue_comment",
  "Update an existing issue comment",
  {
    comment_id: z.number().describe("The comment ID to update"),
    body: z.string().describe("The new comment body"),
  },
  async ({ comment_id, body }) => {
    try {
      const comment = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/issues/comments/${comment_id}`,
        "PATCH",
        { body },
      );

      return {
        content: [
          {
            type: "text",
            text: `Comment updated successfully: ${JSON.stringify(comment, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error updating issue comment: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error updating issue comment: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Get pull request details
server.tool(
  "get_pull_request",
  "Get details of a specific pull request",
  {
    pr_number: z.number().describe("The pull request number to fetch"),
  },
  async ({ pr_number }) => {
    try {
      const pr = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${pr_number}`,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(pr, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error getting pull request: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error getting pull request: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Get pull request files
server.tool(
  "get_pull_request_files",
  "Get files changed in a pull request",
  {
    pr_number: z.number().describe("The pull request number to fetch files for"),
  },
  async ({ pr_number }) => {
    try {
      const files = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${pr_number}/files`,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(files, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error getting pull request files: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error getting pull request files: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Get file contents
server.tool(
  "get_file_contents",
  "Get the contents of a file from the repository",
  {
    path: z.string().describe("The file path to fetch"),
    ref: z.string().optional().describe("The branch or commit ref (optional)"),
  },
  async ({ path, ref }) => {
    try {
      let endpoint = `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(path)}`;
      if (ref) {
        endpoint += `?ref=${encodeURIComponent(ref)}`;
      }

      const file = await giteaRequest(endpoint);

      // Decode base64 content if it's a file
      if (file.content && file.encoding === "base64") {
        const decodedContent = Buffer.from(file.content, "base64").toString("utf-8");
        return {
          content: [
            {
              type: "text",
              text: `File: ${path}\n\n${decodedContent}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(file, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error getting file contents: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error getting file contents: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// List repository branches
server.tool(
  "list_branches",
  "List all branches in the repository",
  {},
  async () => {
    try {
      const branches = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/branches`,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(branches, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error listing branches: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error listing branches: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Create a new branch
server.tool(
  "create_branch",
  "Create a new branch in the repository",
  {
    new_branch_name: z.string().describe("Name of the new branch to create"),
    old_branch_name: z.string().describe("Name of the source branch"),
  },
  async ({ new_branch_name, old_branch_name }) => {
    try {
      const branch = await giteaRequest(
        `/api/v1/repos/${REPO_OWNER}/${REPO_NAME}/branches`,
        "POST",
        {
          new_branch_name,
          old_branch_name,
        },
      );

      return {
        content: [
          {
            type: "text",
            text: `Branch created successfully: ${JSON.stringify(branch, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[GITEA-MCP] Error creating branch: ${errorMessage}`);
      return {
        content: [
          {
            type: "text",
            text: `Error creating branch: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

console.log("[GITEA-MCP] Gitea API Operations MCP Server started");