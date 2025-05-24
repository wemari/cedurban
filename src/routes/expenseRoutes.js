// routes/expenseRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/expenseController');

router
  .route('/')
  .get(ctrl.getAllExpenses)
  .post(ctrl.createExpense);

router
  .route('/:id')
  .get(ctrl.getExpenseById)
  .put(ctrl.updateExpense)
  .delete(ctrl.deleteExpense);

module.exports = router;
