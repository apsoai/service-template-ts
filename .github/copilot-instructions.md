# Copilot instructions

This repository is an **Apso** service. Backend code is generated from the `.apsorc` schema at the
project root.

Read `AGENTS.md` at the repository root for the full operating contract. The rules that matter
most:

- **Never edit files under `src/autogen/`.** They are overwritten on every
  `apso generate`. Put product code in `src/extensions/` instead.
- **`.apsorc` is the source of truth** for entities, fields, relationships, auth, tenant scope,
  and indexes. Change the schema and regenerate rather than hand-writing entities, controllers,
  services, DTOs, or migrations.
- **Define each relationship exactly once.** Apso generates the inverse side.
- **Never invent `.apsorc` syntax.** If a key is not documented at <https://docs.apso.ai/rules/>,
  it does not exist.
- **Scope tenant-owned entities with `scopeBy`.**

The loop is: edit `.apsorc`, then `apso schema validate`, then `apso generate`, then build, then `apso doctor`.
