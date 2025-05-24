// src/routes/memberDepartmentRoutes.js

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/memberDepartmentController');

router.post('/', ctrl.createAssignment);
router.get('/', ctrl.getAllAssignments);
router.get('/:id', ctrl.getAssignmentById);
router.put('/:id', ctrl.updateAssignment);
router.delete('/:id', ctrl.deleteAssignment);

module.exports = router;
