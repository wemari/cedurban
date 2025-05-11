const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes for authentication flow
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/request-reset', authCtrl.requestReset);
router.post('/reset-password', authCtrl.resetPassword);

// Protected example route (uncomment when needed)
// router.get('/profile', authenticate, authCtrl.profile);

module.exports = router;
