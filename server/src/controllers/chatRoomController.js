const ChatRoom = require('../models/chatRoom');

exports.createChatRoom = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const newChatRoom = new ChatRoom({ name, participants });
    await newChatRoom.save();
    res.status(201).json({ message: 'Chat room created successfully' });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const chatRooms = await ChatRoom.find({ participants: userId })
      .populate('participants', 'username')
      .populate('messages');
    res.status(200).json({ chatRooms });
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find()
    res.status(200).json({ chatRooms });
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.joinChatRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom.participants.includes(userId)) {
      chatRoom.participants.push(userId);
      await chatRoom.save();
      res.status(200).json({ message: 'User joined the chat room' });
    } else {
      res.status(400).json({ error: 'User is already a participant in the chat room' });
    }
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.leaveChatRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const chatRoom = await ChatRoom.findById(roomId);
    const participantIndex = chatRoom.participants.indexOf(userId);

    if (participantIndex !== -1) {
      chatRoom.participants.splice(participantIndex, 1);
      await chatRoom.save();
      res.status(200).json({ message: 'User left the chat room' });
    } else {
      res.status(400).json({ error: 'User is not a participant in the chat room' });
    }
  } catch (error) {
    console.error('Error leaving chat room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getChatRoomUsers = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chatRoom = await ChatRoom.findById(roomId).populate('participants', 'username');

    if (chatRoom) {
      const participants = chatRoom.participants.map((participant) => ({
        userId: participant._id,
        username: participant.username,
      }));

      res.status(200).json({ participants });
    } else {
      res.status(404).json({ error: 'Chat room not found' });
    }
  } catch (error) {
    console.error('Error getting chat room users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

