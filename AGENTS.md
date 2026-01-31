# Agent Guidelines for Ecto

Ecto is a modern template consolidation engine that provides a unified interface for working with multiple popular template engines (EJS, Markdown, Pug, Nunjucks, Mustache, Handlebars, and Liquid).

## Project Overview

- **Purpose**: Simplify template rendering by providing a single API for multiple template engines with automatic engine selection based on file extensions
- **Architecture**: TypeScript library with a plugin architecture - `Ecto` coordinates engines, `BaseEngine` provides common functionality, individual engine classes handle specific template formats
- **Key Dependencies**: `ejs`, `pug`, `nunjucks`, `liquidjs`, `@jaredwray/fumanchu` (Handlebars/Mustache), `writr` (Markdown), `cacheable` (caching), `hookified` (events/hooks)

## Development Commands

- Use `pnpm` instead of `npm` for all package management commands
- `pnpm build` - Build TypeScript to ESM with type declarations
- `pnpm test` - Run linting and tests with coverage
- `pnpm lint` - Run Biome linter with auto-fix
- `pnpm clean` - Remove dist, coverage, node_modules, and lock files

## Code Quality Requirements

- Always run `pnpm test` to verify tests pass before completing changes
- All new code must have corresponding tests
- Follow existing code patterns in `src/ecto.ts` for the main class
- Use Biome for linting and formatting (configured in the project)
- TypeScript strict mode is enabled

## Project Structure

- `src/ecto.ts` - Main Ecto class (core engine coordinator)
- `src/base-engine.ts` - Base class for all engines
- `src/engine-interface.ts` - TypeScript interface for engine implementations
- `src/engine-map.ts` - Manages file extension to engine mappings
- `src/engines/` - Individual engine implementations (ejs, handlebars, liquid, markdown, nunjucks, pug)
- `test/` - Vitest test files

## Engine Mapping

- `.ejs` → EJS
- `.md`, `.markdown` → Markdown
- `.pug`, `.jade` → Pug
- `.njk` → Nunjucks
- `.mustache` → Mustache
- `.handlebars`, `.hbs`, `.hjs` → Handlebars
- `.liquid` → Liquid

## Key Considerations

- Async and sync rendering methods are available (`render`/`renderSync`, `renderFromFile`/`renderFromFileSync`)
- FrontMatter support is built-in for Markdown files
- Caching is available via the `cacheable` library for performance optimization
- Hooks system allows intercepting and modifying data during rendering
- Custom engines can be created by implementing the `EngineInterface`
