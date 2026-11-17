-- OFFLINE* Hybrid Fashion Discovery & Multi-Dimensional Taxonomy Schema
-- Normalized Relational Blueprint (PostgreSQL-compatible DDL)

CREATE TABLE models (
  id                TEXT PRIMARY KEY,
  code              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  height_cm         INTEGER NOT NULL,
  studio_note       TEXT NOT NULL,
  image_url         TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE looks (
  id                  TEXT PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  index_number        TEXT NOT NULL,
  title               TEXT NOT NULL,
  model_id            TEXT NOT NULL REFERENCES models(id),
  main_image_url      TEXT NOT NULL,
  outfit_description  TEXT NOT NULL,
  featured            BOOLEAN NOT NULL DEFAULT FALSE,
  status              TEXT NOT NULL CHECK (status IN ('published', 'draft')),
  popularity_score    INTEGER NOT NULL DEFAULT 0,
  trending_score      INTEGER NOT NULL DEFAULT 0,
  featured_in_mode    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_looks_status_featured ON looks(status, featured, created_at DESC);
CREATE INDEX idx_looks_popularity ON looks(popularity_score DESC, trending_score DESC);

CREATE TABLE products (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  sku               TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  main_image_url    TEXT NOT NULL,
  gallery_images    JSONB NOT NULL DEFAULT '[]',
  category_slug     TEXT NOT NULL,
  price             NUMERIC(10, 2),
  stock_status      TEXT NOT NULL CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  material_summary  TEXT NOT NULL,
  swatch_color      TEXT NOT NULL,
  popularity_score  INTEGER NOT NULL DEFAULT 0,
  trending_score    INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_slug, price);
CREATE INDEX idx_products_stock ON products(stock_status, created_at DESC);

CREATE TABLE product_variants (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku           TEXT NOT NULL UNIQUE,
  size          TEXT NOT NULL,
  color_slug    TEXT NOT NULL,
  color_name    TEXT NOT NULL,
  color_hex     TEXT NOT NULL,
  stock_qty     INTEGER NOT NULL DEFAULT 0,
  stock_status  TEXT NOT NULL CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'))
);

CREATE INDEX idx_variants_product ON product_variants(product_id, color_slug, size);

CREATE TABLE look_products (
  look_id        TEXT NOT NULL REFERENCES looks(id) ON DELETE CASCADE,
  product_id     TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  role           TEXT NOT NULL CHECK (role IN ('primary', 'layered')),
  marker_number  TEXT NOT NULL,
  callout_side   TEXT NOT NULL CHECK (callout_side IN ('left', 'right')),
  x_percent      NUMERIC(5, 2) NOT NULL,
  y_percent      NUMERIC(5, 2) NOT NULL,
  display_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (look_id, product_id)
);

CREATE INDEX idx_look_products_product ON look_products(product_id);

CREATE TABLE filter_dimensions (
  id                  TEXT PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  short_label         TEXT NOT NULL,
  description         TEXT NOT NULL,
  display_order       INTEGER NOT NULL,
  allow_multi_select  BOOLEAN NOT NULL DEFAULT TRUE,
  is_hierarchical     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE filter_options (
  id             TEXT PRIMARY KEY,
  dimension_id   TEXT NOT NULL REFERENCES filter_dimensions(id) ON DELETE CASCADE,
  slug           TEXT NOT NULL,
  label          TEXT NOT NULL,
  parent_id      TEXT REFERENCES filter_options(id) ON DELETE SET NULL,
  group_label    TEXT,
  swatch_hex     TEXT,
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (dimension_id, slug)
);

CREATE INDEX idx_filter_options_dim ON filter_options(dimension_id, is_active, display_order);
CREATE INDEX idx_filter_options_parent ON filter_options(parent_id);

CREATE TABLE look_filter_options (
  look_id    TEXT NOT NULL REFERENCES looks(id) ON DELETE CASCADE,
  option_id  TEXT NOT NULL REFERENCES filter_options(id) ON DELETE CASCADE,
  source     TEXT NOT NULL CHECK (source IN ('editorial', 'inherited_from_product')),
  PRIMARY KEY (look_id, option_id)
);

CREATE INDEX idx_lfo_option ON look_filter_options(option_id, look_id);

CREATE TABLE product_filter_options (
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_id   TEXT NOT NULL REFERENCES filter_options(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, option_id)
);

CREATE INDEX idx_pfo_option ON product_filter_options(option_id, product_id);

CREATE TABLE collections (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  subtitle        TEXT NOT NULL,
  editorial_note  TEXT NOT NULL,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  display_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE collection_looks (
  collection_id  TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  look_id        TEXT NOT NULL REFERENCES looks(id) ON DELETE CASCADE,
  display_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, look_id)
);

CREATE INDEX idx_collection_looks_look ON collection_looks(look_id);
