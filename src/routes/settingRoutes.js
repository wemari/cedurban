// src/routes/settingRoutes.js

const express = require('express');
const ctrl    = require('../controllers/settingController');
const router  = express.Router();

// ── Base Currency ────────────────────────────────────────────────────────
// GET  /api/settings/base-currency
router.get('/base-currency',    ctrl.getBaseCurrency);
// PUT  /api/settings/base-currency
router.put('/base-currency',    ctrl.setBaseCurrency);

// ── Import‑Column Settings CRUD ─────────────────────────────────────────
// (Assumes you have importColumnController mounted separately under /import-columns)

// ── Dynamic Schema Endpoints ────────────────────────────────────────────
// List all user tables in the public schema
// GET  /api/settings/tables
router.get('/tables',            ctrl.getTables);

// List columns for a given table
// GET  /api/settings/tables/:table/columns
router.get('/tables/:table/columns', ctrl.getColumnsForTable);

module.exports = router;
