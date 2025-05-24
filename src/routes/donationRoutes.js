const express = require('express');
const router  = express.Router();
const uploader   = require('../middleware/uploadProof');
const ctrl    = require('../controllers/donationController');

// CRUD
router.get('/',            ctrl.listDonations);
router.get('/:id',         ctrl.getDonation);
router.post('/',           ctrl.createDonation);
router.put('/:id',         ctrl.updateDonation);
router.delete('/:id',      ctrl.deleteDonation);

// ... existing CRUD ...
router.post('/:id/proof', uploader.single('file'), ctrl.uploadProof);

// online payment stubs
router.post('/pay',            ctrl.startOnlinePayment);
router.get('/pay/callback',    ctrl.handlePaymentCallback);

module.exports = router;



