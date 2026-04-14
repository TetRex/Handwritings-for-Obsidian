# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Obsidian plugin with a single TypeScript entry point. `main.ts` contains the plugin logic, command registration, and handwriting UI behavior. `manifest.json` defines plugin metadata for Obsidian. `styles.css` holds plugin styles, though it is currently a placeholder. `esbuild.config.mjs` drives bundling, `tsconfig.json` defines strict TypeScript settings, and `main.js` is the generated build artifact that Obsidian loads.

## Build, Test, and Development Commands
- `npm install`: install local development dependencies.
- `npm run dev`: start esbuild in watch mode and rebuild `main.js` on changes.
- `npm run build`: create a production bundle once.

There is no dedicated test runner yet. Validate changes by rebuilding and loading the plugin in an Obsidian vault’s `.obsidian/plugins/handwriting-pad/` directory.

## Coding Style & Naming Conventions
Use TypeScript with tabs for indentation, matching the existing files. Keep `strict`, `noImplicitAny`, and `strictNullChecks` compliance intact. Prefer clear PascalCase for classes and types such as `HandwritingPlugin` and `Point`, and camelCase for methods and local variables such as `openPad` or `currentStroke`. Keep DOM event handlers small and typed explicitly when practical.

## Testing Guidelines
Because there is no automated coverage yet, every change should include manual verification notes. At minimum, test command registration, opening the handwriting pad, pointer drawing, and any toolbar actions affected by the change. If automated tests are introduced later, keep them close to the plugin entry flow and document the command used to run them.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries such as `Implement Handwriting Pad UI...` and `Refactor Handwriting Pad canvas...`. Follow that pattern: start with a verb, keep the subject specific, and avoid unrelated changes in one commit.

For pull requests, include:
- a brief description of user-visible behavior changes
- manual test steps and results
- screenshots or a short recording for UI changes
- links to related issues or notes when relevant

## Obsidian Plugin Notes
Keep `manifest.json`, `main.js`, and `styles.css` aligned for release-ready changes. If you add commands, settings, or UI elements, make sure the bundled output is rebuilt before submitting work.
