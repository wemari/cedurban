// routes/bankRoutes.js
const express = require('express');
const ctrl    = require('../controllers/bankController');
const router  = express.Router();

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
