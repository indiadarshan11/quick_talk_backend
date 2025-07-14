const express = require('express');
const router = express.Router();
const { loginUser, registerUser, matchContacts } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// POST /api/auth/match-contacts
router.post('/match-contacts', matchContacts);

module.exports = router;
