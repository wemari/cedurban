const express = require('express');
const router = express.Router();
const controller = require('../controllers/newConvertController');

router.get('/', controller.getAllNewConverts);
router.post('/', controller.createNewConvert);
router.put('/:id', controller.updateNewConvert);
router.delete('/:id', controller.deleteNewConvert);

module.exports = router;
