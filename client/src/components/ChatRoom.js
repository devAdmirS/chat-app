import React, { useState, useEffect } from 'react';
import { handleRequest } from '../services/ChatService';
import { Container, TextField, Button, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';
import './../style/ChatRoom.css';


const ChatRoom = ({ currentUser, joinChatRoom }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [newChatRoomName, setNewChatRoomName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChatRooms = chatRooms.filter((chatRoom) =>
    chatRoom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await handleRequest(`/chat-room`, 'GET');
        setChatRooms(response.chatRooms);
      } catch (error) {
        console.error('Error getting chat rooms:', error);
      }
    };

    fetchChatRooms();
  }, [currentUser.userId]);


  const createChatRoom = async () => {
    try {
      await handleRequest(`/chat-room`, 'POST', {
        name: newChatRoomName,
        participants: [currentUser.userId],
      });

      const updatedChatRooms = await handleRequest(`/chat-room`, 'GET');
      setChatRooms(updatedChatRooms.chatRooms);

      setNewChatRoomName('');
    } catch (error) {
      console.error('Error creating or fetching chat rooms:', error);
    }
  };

  return (
    <Container maxWidth="md" className='chatRoom-container'>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4">Search Chat Rooms</Typography>
            <TextField
              type="text"
              label="Search"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4">Create a New Chat Room</Typography>
            <TextField
              type="text"
              label="Enter chat room name"
              variant="outlined"
              fullWidth
              value={newChatRoomName}
              onChange={(e) => setNewChatRoomName(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={createChatRoom} fullWidth>
              Create
            </Button>
          </Grid>

        </Grid>

        <Typography variant="h4" className='chatRoom-title'>Chat Rooms</Typography>
        <List>
          {filteredChatRooms.map((chatRoom, index) => (
            <ListItem
              key={chatRoom._id}
              style={{
                borderBottom: index < filteredChatRooms.length - 1 ? '1px solid #ccc' : 'none',
              }}
            >
              <ListItemText primary={chatRoom.name} />
              <Button variant="contained" color="primary" onClick={() => joinChatRoom(chatRoom)}>
                Join
              </Button>
            </ListItem>
          ))}
        </List>
      </div>
    </Container>
  );
};

export default ChatRoom;
