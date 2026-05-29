# AGENTS.md

## Overview

This repository is a full-stack fridge and pantry inventory manager built with Vite, React 18, Vanilla CSS, and Netlify Serverless Functions.

- `src/App.jsx` contains the main app container, global layout navigation, toast manager, page state switcher, and global API query states (Increment, Decrement, Delete, Restock).
- `src/pages/` includes main pages (`Inventory.jsx` for catalog management and `GroceryList.jsx` for smart purchase recommendations).
- `src/components/` contains reusable interactive blocks (`ItemRow.jsx` cards, list entries, and the modal dialog `ItemForm.jsx`).
- `netlify/functions/` contains the backend endpoints (`items.js`, `item-increment.js`, etc.) utilizing a Postgres connection pool with a seamless local JSON database fallback (`db.json`) handled by `db.js`.
- `netlify.toml` handles routing and proxies HTTP requests under `/api/*` to appropriate Netlify functions.

## Working Rules

- **Strict Separation of Concerns**: Keep frontend views and pages under `src/pages/`, structural components in `src/components/`, styling in `src/index.css`, and serverless endpoint logic inside `netlify/functions/`.
- **Database Fallback**: Never assume a PostgreSQL database is present in local development. Always ensure compatibility with the `db.json` file-based fallback helper located in `netlify/functions/db.js`.
- **Aesthetic Intent**: Maintain the high-quality modern styling and variables inside `src/index.css` (custom HSL color palette, rich card borders, subtle toast micro-animations, clean typography, responsive flex/grid layouts). Do not add TailwindCSS or other CSS utility libraries unless explicitly asked.
- **Git Housekeeping**: Never attempt to add, edit, or commit generated files (`dist/`, `.netlify/`, `db.json`) or dependency folder (`node_modules/`). Ensure they remain ignored by `.gitignore`.

## Commands

- `npm run dev` starts the Vite frontend dev server (port 5173).
- `npx netlify dev` (recommended) starts the Netlify CLI development environment (port 8888) with hot reloading for both serverless backend API functions and the Vite frontend.
- `npm run build` runs compilation and stores optimized production-ready bundle output in `dist/`.
- `npm run preview` runs a local preview server serving the production build.

## Validation

After editing components, CSS, or backend functions, run these checks:
1. **Frontend Compilation**: Run `npm run build` to verify there are no JSX syntax errors, import mismatches, or bundle failures.
2. **Interactive UI Verification**:
   - Items search and filtering works in real-time.
   - Quantity increment (`+`) and decrement (`-`) are atomic, fast, and display optimistic state updates.
   - Low stock items automatically pop up in the **Grocery List** and can be Restocked.
   - Toasts trigger correctly for success and error states.

## Notes

- There is no automated test runner configured. Verification should be done by checking pages and operations visually in the browser via Netlify dev server.
- Keep the application structure lean. Avoid introducing unnecessary packages, routing frameworks, or complicated state management (like Redux) unless requested by the user.
