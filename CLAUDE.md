# CLAUDE.md

Read `AGENTS.md` in this directory. It is the operating contract for backend work in this
repository and applies in full to Claude Code.

Two things that are worth repeating here because they are the most common and most expensive
mistakes:

- **Never edit generated code.** It lives under `src/autogen/` and is overwritten on every
  `apso generate`. Product code goes in `src/extensions/`.
- **`.apsorc` is the source of truth.** Change the schema and regenerate rather than hand-writing
  entities, controllers, services, DTOs, or migrations.

Full rules: <https://docs.apso.ai/rules/>

If the Apso MCP server is available, read `apso://current-schema` before proposing backend
changes and prefer the Apso tools over shelling out.
