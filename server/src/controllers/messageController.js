const Message = require('../models/message');

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    const receiverType = req.body.receiverType;
    if (!['User', 'ChatRoom'].includes(receiverType)) {
      return res.status(400).json({ error: 'Invalid receiver type' });
    }

    const newMessage = new Message({ sender, receiver, receiverType, content });
    await newMessage.save();

    const savedMessage = await Message.populate(newMessage, [
      { path: 'sender', select: 'username' },
      { path: 'receiver', select: 'username' },
    ]);

    res.status(201).json({ message: savedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    console.log('Sender ID:', senderId);
    console.log('Receiver ID:', receiverId);

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId, receiverType: 'User' },
        { sender: receiverId, receiver: senderId, receiverType: 'User' },
      ]
    })
      .populate('sender', 'username')
      .populate('receiver', 'username');

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({
        receiver: roomId, 
        receiverType: 'ChatRoom',
    })
      .populate('sender', 'username')
      .populate('receiver', 'username');

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
