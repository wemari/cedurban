// src/routes/memberFamilyRoutes.js

const express = require('express');
const router = express.Router();
const memberFamilyController = require('../controllers/memberFamilyController');

// Routes
router.post('/', memberFamilyController.createFamilyLink);
router.get('/', memberFamilyController.getAllFamilyLinks);
router.get('/:id', memberFamilyController.getFamilyLinkById);
router.put('/:id', memberFamilyController.updateFamilyLink);
router.delete('/:id', memberFamilyController.deleteFamilyLink);

module.exports = router;
