import React from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Grid } from '@mui/material';
import './../style/Users.css';

const Users = ({ currentUserId, users, onlineUsers, joinChatRoom = null, privateChat = false }) => {
    return (
        <List className='users'>
            {users.map((user, index) => {
                if (user.userId === currentUserId) {
                    return null;
                }
                const isOnline = onlineUsers.some(onlineUser => onlineUser.userId === user.userId);

                return (
                    <ListItem key={index}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2} sm={1}>
                                <ListItemAvatar>
                                    <Avatar style={{ backgroundColor: isOnline ? 'green' : 'red' }}>
                                        {user.username.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                            </Grid>
                            <Grid item xs={2} sm={1}>
                                <ListItemText primary={user.username} secondary={isOnline ? 'Online' : 'Offline'} />
                            </Grid>
                            <Grid item xs={12} sm={12} md={8}>
                                {joinChatRoom && (
                                    <Button variant="contained" color="primary" onClick={() => joinChatRoom(user.userId)}>
                                        Send private message
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default Users;
