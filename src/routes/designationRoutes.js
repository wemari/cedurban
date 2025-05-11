// src/routes/designationRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/designationsController');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;