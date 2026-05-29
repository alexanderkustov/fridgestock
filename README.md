# 🧊 Fridgestock - Fridge & Pantry Stock Manager

A sleek, responsive full-stack web application to keep track of your home inventory (fridge, freezer, pantry) and automatically generate grocery shopping lists when items run low. Built with **React**, **Vite**, **Vanilla CSS**, and **Netlify Functions** with flexible database integration (PostgreSQL or local file-based JSON fallback).

---

## ✨ Features

- **📊 Dynamic Dashboard Stats**: Instantly see total items, low stock warnings, and healthy stock status.
- **📦 Inventory Management**:
  - View all items grouped by location (Fridge, Freezer, Pantry).
  - High-speed interactive controls: Increment and decrement item quantities atomically.
  - Search and filter items in real-time.
  - Add new items and delete existing ones with immediate feedback.
- **🛒 Automated Smart Grocery List**:
  - Dynamically lists any item where `current_quantity <= minimum_quantity`.
  - Calculates exactly how much to buy to reach the target capacity (`target_quantity - current_quantity`).
  - Restock items directly with a single click.
- **⚡ Optimistic UI**: Super-fast interactions backed by clean REST API endpoints.
- **🔌 Flexible Database Backend**:
  - Automatically falls back to a persistent local `db.json` database for zero-config local development.
  - Switches seamlessly to a hosted **PostgreSQL** database (e.g. Neon, Supabase, etc.) when `DATABASE_URL` is set in production.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide React (icons)
- **Styling**: Vanilla CSS (sleek dark-mode elements, modern flexbox/grid layout)
- **Backend Serverless**: Netlify Functions (Node.js)
- **Database**: PostgreSQL (via `pg`) or persistent JSON File-based Mock Database

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### ⚙️ Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/alexanderkustov/fridgestock.git
   cd fridgestock
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

### 💻 Local Development

Run the Vite development server coupled with Netlify Dev to run both frontend and serverless functions in parallel:

```bash
# Using Netlify CLI (recommended for full API + Frontend experience)
npx netlify dev
```

Alternatively, if you only want to work on frontend styling and views:
```bash
npm run dev
```

*Note: When running without `DATABASE_URL` configured in your environment variables, the app will automatically initialize and use a local `db.json` file in the root folder as its database fallback.*

### 🏗️ Production Build

To build the static frontend bundle and optimize it for production:

```bash
npm run build
```

This compiles your React project and outputs the static assets to the `dist` folder, ready for deployment.

---

## 📁 Repository Structure

```
├── .netlify/              # Netlify local configuration and build cache (ignored)
├── dist/                  # Compiled production static output (ignored)
├── netlify/
│   └── functions/         # Netlify serverless functions (Node.js API)
│       ├── db.js          # Shared database pool connection and JSON fallback helper
│       ├── grocery-list.js# API for retrieving items that are low in stock
│       ├── item-decrement.js # API for atomic item decrement
│       ├── item-increment.js # API for atomic item increment
│       └── items.js       # Main CRUD API for item management
├── src/
│   ├── components/        # Shared React presentation components
│   │   ├── GroceryRow.jsx # Renders a row in the grocery list
│   │   ├── ItemForm.jsx   # Interactive modal/form to add or edit items
│   │   └── ItemRow.jsx    # Renders an individual item card in the inventory
│   ├── pages/             # Page layouts
│   │   ├── GroceryList.jsx# Grocery List page and restocking dashboard
│   │   └── Inventory.jsx  # Inventory listing and search dashboard
│   ├── App.jsx            # Main app shell, global states, API handlers, toasts
│   ├── main.jsx           # Vite entrypoint
│   └── index.css          # Core visual system, global variables, custom utilities
├── db.json                # Local fallback mock JSON database (generated, ignored)
├── package.json           # Project manifest and scripts
├── netlify.toml           # Netlify settings, build setup, and API routes redirect rules
└── vite.config.js         # Vite bundler configurations
```

---

## 📜 Database Setup (Optional PostgreSQL)

To configure the application with a PostgreSQL database, set the `DATABASE_URL` environment variable:

```env
DATABASE_URL="postgres://username:password@hostname:5432/database"
```

The app's Postgres schema uses an `items` table with the following layout:

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_quantity INTEGER NOT NULL DEFAULT 0,
  target_quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  location VARCHAR(100) NOT NULL DEFAULT 'fridge',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📄 License

Private/Proprietary.
