# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Obsidian plugin (`pencil-notes`, see `manifest.json`). TypeScript source in `src/`, bundled by esbuild to a single `main.js` at the repo root — that file plus `manifest.json` is what Obsidian loads.

## Commands

- `npm run dev` — esbuild in watch mode (inline sourcemaps). Leave running while editing.
- `npm run build` — one-shot production build (no sourcemaps), writes `main.js`.

There is no test runner, linter, or formatter configured. Do not invent `npm test` / `npm run lint` scripts.

## Architecture

- **Entry point**: `src/main.ts` exports the default `Plugin` subclass. Everything hangs off `onload()` / `onunload()`.
- **Bundling** (`esbuild.config.mjs`): `obsidian` is marked external, output format is CommonJS, target `es2018`, single outfile `main.js`. Do not add other externals unless you also ship them as separate files Obsidian can resolve.
- **TypeScript** (`tsconfig.json`): `strictNullChecks` + `noImplicitAny` are on, but full `strict` is off. Module is `ESNext` with `node` resolution; only `src/**/*.ts` is included.
- **Styles**: `styles/main.css` exists but is not imported by the bundle. For Obsidian to pick it up it must be named `styles.css` at the repo root alongside `main.js` and `manifest.json`.

## Code block processors

`pencil` fenced blocks are rendered via `registerMarkdownCodeBlockProcessor` in `src/main.ts`. The processor parses the block body as simple `key: value` lines (not a full YAML parser) and reads `sketch-id`, falling back to a generated 8-char id. When adding new keys, extend the same lightweight parser rather than pulling in a YAML dependency — keeping the bundle small and `obsidian` as the only external is a deliberate choice.
