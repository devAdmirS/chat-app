import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Grid } from '@mui/material';
import {
  getMessagesOfChatRoom,
  getPrivateMessages,
  sendMessage,
  getAllChatRoomUsers
} from '../services/ChatService';
import Users from './Users';
import Message from './Message';
import './../style/Chat.css'

const Chat = ({ currentUser, selectedChatRoom, onLeaveChatRoom, socket, privateChat = false }) => {
  const [chatData, setChatData] = useState({
    chatRoomUsers: [],
    messages: [],
    onlineChatRoomUsers: [],
  });

  const [newMessage, setNewMessage] = useState('');
  const [isRateLimited, setRateLimited] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      if (selectedChatRoom) {
        try {
          const response = privateChat
            ? await getPrivateMessages(currentUser.userId, selectedChatRoom)
            : await getMessagesOfChatRoom(selectedChatRoom._id);

          setChatData((prevData) => ({ ...prevData, messages: response.messages }));

          const data = {
            sender: { _id: currentUser.userId, username: currentUser.user },
            content: 'Joined',
            receiver: privateChat ? selectedChatRoom : selectedChatRoom._id,
            notification: 'join',
            receiverType: privateChat ? 'User' : 'ChatRoom'
          };

          socket.current.emit('joinRoom', data);

          socket.current.on('getMessage', (data) => {
            setChatData((prevData) => ({ ...prevData, messages: [...prevData.messages, data] }));
            handleMessage();
          });

          socket.current.on('userJoinedRoom', async (data) => {
            if (!privateChat) {
              setChatData((prevData) => ({ ...prevData, messages: [...prevData.messages, data.data] }));

              try {
                const usersResponse = await getAllChatRoomUsers(selectedChatRoom._id);
                setChatData((prevData) => ({ ...prevData, chatRoomUsers: usersResponse.participants }));
              } catch (error) {
                console.error('Error fetching chat room users:', error);
              }

              setChatData((prevData) => ({ ...prevData, onlineChatRoomUsers: data.currentUsers }));
              handleMessage();
            }
          });

          socket.current.on('userLeftRoom', (data) => {
            if (!privateChat) {
              setChatData((prevData) => ({ ...prevData, messages: [...prevData.messages, data.data] }));
              setChatData((prevData) => ({ ...prevData, onlineChatRoomUsers: data.currentUsers }));
              handleMessage();
            }
          });

          handleMessage();

        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    initializeChat();
  }, [selectedChatRoom, currentUser, socket, privateChat]);

  const handleSendMessage = async () => {
    const currentTime = new Date().getTime();

    if (newMessage.trim() !== '' && !isRateLimited) {
      if (currentTime - lastMessageTime < 60000 && messageCount >= 10) {
        setRateLimited(true);

        const timeRemaining = 60 - Math.floor((currentTime - lastMessageTime) / 1000);

        setTimeLeft(timeRemaining);

        let countdownTimer = setInterval(() => {
          setTimeLeft((prevTimeLeft) => {
            if (prevTimeLeft === 1) {
              clearInterval(countdownTimer);
              setRateLimited(false);
            }
            return prevTimeLeft - 1;
          });
        }, 1000);

        return;
      }

      const userId = currentUser.userId;
      const username = currentUser.user;
      const message = {
        content: newMessage,
        sender: currentUser.userId,
        receiver: privateChat ? selectedChatRoom : selectedChatRoom._id,
        receiverType: privateChat ? 'User' : 'ChatRoom',
      };

      socket.current.emit('sendMessage', {
        sender: { _id: userId, username: username },
        content: newMessage,
        receiver: privateChat ? selectedChatRoom : selectedChatRoom._id,
        receiverType: privateChat ? 'User' : 'ChatRoom',
      });

      await sendMessage(message);
      setNewMessage('');

      setMessageCount((prevCount) => prevCount + 1);
      setLastMessageTime(currentTime);

      handleMessage();
    }
  };

  const handleLeaveChatRoom = () => {
    if (!isRateLimited) {
      const data = {
        sender: { _id: currentUser.userId, username: currentUser.user },
        content: 'Left',
        receiver: privateChat ? selectedChatRoom : selectedChatRoom._id,
        notification: 'leave',
      };
      socket.current.emit('leaveRoom', data);
      onLeaveChatRoom();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessage = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className='chat'>
      <Message messages={chatData.messages} currentUser={currentUser} messagesContainerRef={messagesContainerRef} />
      <Users currentUserId={currentUser.userId} users={chatData.chatRoomUsers} onlineUsers={chatData.onlineChatRoomUsers} />
      <Grid container spacing={2} style={{ marginTop: '16px' }}>
        <Grid item xs={10}>
          <TextField
            fullWidth
            label="Type your message"
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            style={{ height: '100%', paddingLeft: 0 }}
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </Grid>
      </Grid>
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        onClick={handleLeaveChatRoom}
        style={{ marginTop: '16px' }}
        disabled={isRateLimited}
      >
        Leave Chat Room
      </Button>
      {isRateLimited && (
        <div style={{ marginTop: '16px', textAlign: 'center', color: 'red' }}>
          Rate limit exceeded. Please wait {timeLeft} seconds before sending another message.
        </div>
      )}
    </div>
  );
};

export default Chat;
