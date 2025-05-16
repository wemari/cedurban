// routes/accountTransactionRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/accountTransactionController');

router
  .route('/')
  .get(ctrl.getAllTxns)
  .post(ctrl.createTxn);

router
  .route('/:id')
  .get(ctrl.getTxnById)
  .put(ctrl.updateTxn)
  .delete(ctrl.deleteTxn);

module.exports = router;
