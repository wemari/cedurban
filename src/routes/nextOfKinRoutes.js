// src/routes/nextOfKinRoutes.js

const express = require('express');
const router = express.Router();
const nextOfKinController = require('../controllers/nextOfKinController');

// Routes
router.post('/', nextOfKinController.createNextOfKin);
router.get('/', nextOfKinController.getAllNextOfKin);
router.get('/:id', nextOfKinController.getNextOfKinById);
router.put('/:id', nextOfKinController.updateNextOfKin);
router.delete('/:id', nextOfKinController.deleteNextOfKin);

module.exports = router;
