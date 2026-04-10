# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains TypeScript source:
- `src/main.ts`: Obsidian plugin entrypoint and code block processor wiring.
- `src/canvas.ts`: `PencilCanvas` drawing logic, pointer handling, and PNG export.
- `src/toolbar.ts`: `PencilToolbar` UI state and tool controls.
- `styles/main.css` is reserved for plugin styling (currently minimal/empty).
- `manifest.json` defines Obsidian plugin metadata.
- `esbuild.config.mjs` controls bundling; output is `main.js` at repo root.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start esbuild in watch mode for local plugin development.
- `npm run build`: produce a production bundle (`main.js`).

There is no automated test script yet; validation is currently done by loading the plugin in Obsidian and exercising the `pencil` code block flow (draw, save, embed).

## Coding Style & Naming Conventions
- Language: TypeScript (`strictNullChecks` and `noImplicitAny` are enabled).
- Indentation: tabs (match existing files).
- Strings: double quotes.
- Naming: `PascalCase` for classes/types, `camelCase` for functions/variables, `UPPER_SNAKE_CASE` for constants.
- Keep source edits in `src/`; treat `main.js` as generated build output from esbuild.

## Testing Guidelines
- Prefer small, testable units when adding parsing or canvas logic.
- Manual regression checks should include:
- rendering a `pencil` block,
- pen/mouse drawing behavior,
- save/export to `Attachments/pencil-<id>.png`,
- markdown embed insertion on first save.
- If automated tests are added later, place them under `tests/` or alongside modules as `*.test.ts`.

## Commit & Pull Request Guidelines
- Follow the existing commit style: short, imperative subject lines (e.g., `Implement save functionality...`, `Add initial plugin structure...`).
- Keep commits focused by concern (parsing, toolbar, canvas, build config).
- PRs should include:
- a brief summary of behavior changes,
- steps used to validate locally,
- screenshots/GIFs for UI or drawing workflow changes,
- linked issue/task when applicable.
