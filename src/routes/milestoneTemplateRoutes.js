const express = require('express');
const router = express.Router();
const controller = require('../controllers/milestoneTemplateController');

router.get('/', controller.getTemplates);
router.post('/', controller.createTemplate);
router.put('/:id', controller.updateTemplate);
router.delete('/:id', controller.deleteTemplate);

module.exports = router;
