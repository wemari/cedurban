// src/routes/cellGroupRoutes.js

const express = require('express');
const router = express.Router();
const cellGroupController = require('../controllers/cellGroupController');

// Routes
router.post('/', cellGroupController.createCellGroup);
router.get('/', cellGroupController.getAllCellGroups);
router.get('/:id', cellGroupController.getCellGroupById);
router.put('/:id', cellGroupController.updateCellGroup);
router.delete('/:id', cellGroupController.deleteCellGroup);
router.get('/:id/members', cellGroupController.getCellGroupMembers);

module.exports = router;
