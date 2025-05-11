// src/routes/departmentRoutes.js

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/departmentController');

router.post('/', ctrl.createDepartment);
router.get('/with-members', ctrl.getDepartmentsWithMembers); // Add this first
router.get('/', ctrl.getAllDepartments);
router.get('/:id', ctrl.getDepartmentById);
router.put('/:id', ctrl.updateDepartment);
router.delete('/:id', ctrl.deleteDepartment);
router.get('/:id/members', ctrl.getDepartmentMembers); // ✅ Add this just before module.exports





module.exports = router;
