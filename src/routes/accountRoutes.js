// routes/accountRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/accountController');

router
  .route('/')
  .get(ctrl.getAllAccounts)
  .post(ctrl.createAccount);

router
  .route('/:id')
  .get(ctrl.getAccountById)
  .put(ctrl.updateAccount)
  .delete(ctrl.deleteAccount);

module.exports = router;
