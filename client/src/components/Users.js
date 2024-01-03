import React from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Button } from '@mui/material';


const Users = ({ currentUserId, users, onlineUsers, joinChatRoom = null, privateChat = false }) => {
    return (
        <List>
            {users.map((user, index) => {
                if (user.userId === currentUserId) {
                    return null;
                }
                const isOnline = onlineUsers.some(onlineUser => onlineUser.userId === user.userId);

                return (
                    <ListItem key={index}>
                        <ListItemAvatar>
                            <Avatar style={{ backgroundColor: isOnline ? 'green' : 'red' }}>
                                {user.username.charAt(0)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={user.username} secondary={isOnline ? 'Online' : 'Offline'} />
                        {joinChatRoom && (
                            <Button variant="contained" color="primary" onClick={() => joinChatRoom(user.userId)}>
                                Send private message
                            </Button>
                        )}
                    </ListItem>

                );
            })}
        </List>
    )

}
export default Users;
