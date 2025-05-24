// routes/incomeRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/incomeController');

router
  .route('/')
  .get(ctrl.getAllIncome)
  .post(ctrl.createIncome);

router
  .route('/:id')
  .get(ctrl.getIncomeById)
  .put(ctrl.updateIncome)
  .delete(ctrl.deleteIncome);

module.exports = router;
