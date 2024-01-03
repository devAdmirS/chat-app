const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, messageController.sendMessage);

router.get('/user/:senderId/:receiverId', authenticate, messageController.getMessages);

router.get('/room/:roomId', authenticate, messageController.getRoomMessages);

module.exports = router;
