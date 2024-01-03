const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController');
const { authenticate } = require('../middleware/authMiddleware')

router.post('/', authenticate, chatRoomController.createChatRoom);

router.get('/', authenticate, chatRoomController.getAllChatRooms);

router.get('/:roomId/users', authenticate, chatRoomController.getChatRoomUsers);

router.get('/user/:userId', authenticate, chatRoomController.getChatRooms);

router.post('/:roomId/join/:userId', authenticate, chatRoomController.joinChatRoom);

router.post('/:roomId/leave/:userId', authenticate, chatRoomController.leaveChatRoom);

module.exports = router;
