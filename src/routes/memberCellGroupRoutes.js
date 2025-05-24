
// src/routes/memberCellGroupRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/memberCellGroupController');

// Specific fetch endpoints
router.get('/by-group/:cellGroupId', ctrl.getMembershipsByCellGroupId);
router.get('/by-member/:memberId', ctrl.getMembershipsByMemberId);

// Standard CRUD
router.post('/', ctrl.createMembership);
router.get('/', ctrl.getAllMemberships);
router.put('/:id', ctrl.updateMembership);
router.delete('/:id', ctrl.deleteMembership);

module.exports = router;
