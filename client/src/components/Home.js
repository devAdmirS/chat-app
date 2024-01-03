import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, AppBar, IconButton, Typography, Toolbar, Container } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

import Chat from "./Chat";
import ChatRoom from "./ChatRoom";
import { joinChatRoom as joinChatRoomService } from "../services/ChatService";
import { io } from "socket.io-client";
import Users from "./Users";
import { getAllUsers } from "../services/ChatService";

const Home = () => {
  const socket = useRef();
  const { currentUser, logout } = useAuth();
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateChat, setPrivateChat] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      const users = await getAllUsers();

      const mappedUsers = users.map(user => ({
        ...user,
        userId: user._id,
      }));
      setAllUsers(mappedUsers);
    }

    getUsers();
  }, [])

  useEffect(() => {

    socket.current = io();
    socket.current.emit('addUser', currentUser.userId);
    socket.current.on('getUsers', (users) => {
      setOnlineUsers([...users]);
    })


  }, [currentUser, socket]);

  const handleLogout = async () => {
    if (socket) {
      socket.current.disconnect();
    }
    await logout();
  };

  const joinChatRoom = async (chatRoom) => {
    try {
      setSelectedChatRoom(chatRoom);
      if(chatRoom.participants !== undefined) {
        if (!chatRoom.participants.includes(currentUser.userId)) {
          await joinChatRoomService(chatRoom._id, currentUser.userId);
        }
      } else {
        setPrivateChat(true);
      }
    } catch (error) {
      console.error('Error joining chat room:', error);
    }
  };

  const leaveChatRoom = () => {
    setSelectedChatRoom(null);
    setPrivateChat(false);
  };

  return (
    <Container maxWidth="xl">
      <AppBar position="static">
        <Toolbar>
          <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <IconButton edge="start" color="inherit" aria-label="menu" style={{ marginRight: 2 }}>
              <AccountCircle />
            </IconButton>
            <Typography variant="h6" color="inherit" component="div">
              {currentUser.user}
            </Typography>
          </div>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {currentUser && !selectedChatRoom && (
        <ChatRoom
          currentUser={currentUser}
          joinChatRoom={joinChatRoom}
        />
      )}
      {currentUser && !selectedChatRoom && (
        <Container maxWidth="md">
          <Typography variant="h4">All users</Typography>
          <Users currentUserId={currentUser.userId} users={allUsers} onlineUsers={onlineUsers} joinChatRoom={joinChatRoom} privateChat={privateChat} />
        </Container>
      )}
      {currentUser && selectedChatRoom && (
        <Chat currentUser={currentUser} selectedChatRoom={selectedChatRoom} onLeaveChatRoom={leaveChatRoom} socket={socket} privateChat={privateChat} />
      )}
    </Container>
  );
};

export default Home;
