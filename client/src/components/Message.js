import React, { useState } from 'react';
import {Paper, Button} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import './../style/Message.css';


const Message = ({ messages, currentUser, messagesContainerRef }) => {
  const [visibleMessages, setVisibleMessages] = useState(20);

  const loadMoreMessages = () => {
    setVisibleMessages(prevVisibleMessages => prevVisibleMessages + 30);
  };

  const canLoadMore = visibleMessages < messages.length;

  return (
    <Paper ref={messagesContainerRef} elevation={3} style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
      {canLoadMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <Button variant="contained" color="primary" onClick={loadMoreMessages}>Load Older Messages</Button>
        </div>
      )}
      {messages.slice(-visibleMessages).map((message, index) => (
        <div
          key={index}
          className={message.sender._id === currentUser.userId ? 'sender' : 'receiver'}
        >
          {message.notification ? (
            <div style={{ color: message.notification === 'join' ? 'green' : 'red' }}>
              {message.notification === 'join' ? `User ${message.sender.username} joined` : `${message.sender.username} left`}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '70px', marginRight: '20px' }}>
                <Avatar>{message.sender.username.charAt(0)}</Avatar>
                <strong>{message.sender.username}</strong>
              </div>
              <div style={{ marginLeft: '25px', marginTop: '10px' }}>
                {message.content}
              </div>
            </div>
          )}
        </div>

      ))}
    </Paper>
  );
};

export default Message;
