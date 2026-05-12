const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, clearNotifications } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/clear', clearNotifications);

module.exports = router;
