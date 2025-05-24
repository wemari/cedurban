const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/counselingController');

// Admin list all
router.get('/', ctrl.list);

// Admin get one
router.get('/:id', ctrl.get);

// Admin create
router.post('/', ctrl.create);

// Admin update
router.put('/:id', ctrl.update);

// Admin delete
router.delete('/:id', ctrl.delete);

module.exports = router;
