# AGENTS.md

Guidance for AI coding agents working in this repository.

This is an **Apso** service: a NestJS + TypeORM backend generated from a declarative schema. The
full rules are at <https://docs.apso.ai/rules/>. The essentials are below. Read them before
writing any backend code.

## The contract

`.apsorc` at the project root is the source of truth for entities, fields, relationships, auth,
tenant scope, and indexes. To change the backend, change `.apsorc` and regenerate. Do not
hand-write what the generator produces.

## Hard rules

1. **Never edit anything under `src/autogen/`.** It is overwritten on every
   `apso generate`. Entities, controllers, services, DTOs, modules, and enums all live there.
2. **Put product code in `src/extensions/`** (create it if it does not exist yet) and register the
   module in `src/app.module.rest.ts`. Extensions may import generated entities, DTOs, and services.
3. **Define each relationship exactly once** in the top-level `relationships` array. Apso
   generates the inverse side; defining both produces duplicate properties and a compile error.
   Use `"bi_directional": true` if you need the inverse property.
4. **Never invent `.apsorc` syntax.** Every valid key is documented at the link above. If a key
   is not documented, it does not exist, so say so instead of guessing.
5. **Scope tenant-owned entities with `scopeBy`.** It is enforced by the generated scope guard on generated routes. Custom routes and queries you write in extensions are not covered yet (apsoai/cli#156), so check tenant access there yourself and say so in the pull request. Say out loud which entities are
   intentionally global.
6. **State destructive migration and deployment risk before acting.** `apso deploy` pushes code
   and runs migrations against a real database.

## The loop

```bash
# edit .apsorc
apso schema validate     # must pass before generating
apso generate            # writes src/autogen/
npm run build            # must compile
apso doctor              # diagnostics on generated code
```

Database and runtime:

```bash
apso migrate             # generate migration SQL, test against a local PGlite sandbox
apso migrate --apply
apso dev                 # local dev server (--docker for the compose stack)
apso deploy              # push + migrate + deploy the linked service
```

## Layout

```
src/
  autogen/            GENERATED, never edit
    <Entity>/         <Entity>.entity.ts .service.ts .controller.ts .module.ts, dtos/
    enums.ts index.ts
  extensions/         your code (create when needed)
  guards/             generated auth + scope guards (appears after generate)
  app.module.rest.ts  register extension modules here
  migrations/         appears after apso migrate
.apsorc               the schema contract
```

## Overriding a generated route

Nest controllers are not DI-swappable, so a hand-written controller on the same path collides with
the generated one. Set `"http": false` on the entity in `.apsorc` to suppress the generated
controller while keeping the entity, service, DTOs, and module.

## Traps

- A UUID primary key must generate as `@PrimaryGeneratedColumn('uuid')`. If you see
  `@PrimaryColumn()`, inserts will fail with a null ID. Run `apso doctor` and regenerate.
- Entity names that derive to SQL reserved words (`Order`, then `order`) need an explicit
  `"table"` value on the entity.
- `enum` fields require a `values` array.
- Index every `ManyToOne` you intend to filter by: `"index": true` on the relationship.

## MCP

If the Apso MCP server is connected (`apso mcp serve`), prefer its tools (`design_schema`,
`validate_schema`, `scaffold_api`, `setup_auth`, `start_dev_server`, `deploy_api`, `diagnose`,
`report_issue`) and read `apso://current-schema` before proposing changes.

## Before you finish

Validate passes, the build compiles, `apso doctor` is clean, one real product workflow was
exercised end to end, every tenant-owned entity is scoped, and nothing under `src/autogen/` was
modified.
