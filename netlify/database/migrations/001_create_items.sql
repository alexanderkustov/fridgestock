-- Migration: Create items table for Fridge Stock App

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  current_quantity NUMERIC NOT NULL DEFAULT 0,
  minimum_quantity NUMERIC NOT NULL DEFAULT 0,
  target_quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT,
  location TEXT DEFAULT 'fridge',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
