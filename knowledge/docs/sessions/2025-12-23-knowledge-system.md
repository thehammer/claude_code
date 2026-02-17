---
title: Knowledge Management System
tags:
  - session-note
  - mcp
  - documentation
  - knowledge-base
created: 2025-12-23
updated: 2025-12-23
---

# Knowledge Management System

## Summary

Built a comprehensive knowledge management system with MkDocs for browsing and a knowledge-mcp for Claude integration.

## What Was Built

### MkDocs Documentation Site
- Material theme with dark/light mode
- Categories: config, guides, reference, projects, decisions, sessions
- Running at `http://localhost:8080`
- Docker-based deployment

### Knowledge MCP Server
- Port 3006
- Tools: `docs_search`, `docs_list`, `docs_get`, `docs_create`, `docs_suggest`, `docs_index`, `docs_session_note`
- Semantic search with OpenAI embeddings (optional)
- Text search fallback

### Initial Documentation
- MCP servers reference
- Integrations reference
- Session types documentation
- Agents documentation
- Hooks documentation

## Technical Decisions

- Used MkDocs Material for clean UI and built-in search
- Separate MCP for Claude integration vs just static site
- Session notes as markdown files in `sessions/` category
- Frontmatter with tags for categorization

## Related Docs

- [MCP Servers](../reference/mcp-servers.md)
- [Session Types](../config/session-types.md)
