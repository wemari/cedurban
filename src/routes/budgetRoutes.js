// routes/budgetRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/budgetController');

router
  .route('/')
  .get(ctrl.getAllBudgets)
  .post(ctrl.createBudget);

router
  .route('/:id')
  .get(ctrl.getBudgetById)
  .put(ctrl.updateBudget)
  .delete(ctrl.deleteBudget);

module.exports = router;
