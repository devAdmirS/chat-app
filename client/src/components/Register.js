import React, { useState } from 'react';
import { Grid, Paper, Avatar, TextField, Button, Typography } from '@mui/material'
import { Person } from '@mui/icons-material';
import { Link } from "react-router-dom";

const Register = () => {
    const [registrationUsername, setRegistrationUsername] = useState('');
    const [registrationPassword, setRegistrationPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const registerUser = async ()  => {
        try {
            const response = await fetch(`/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: registrationUsername,
                    password: registrationPassword,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setError('');
                setSuccess(data.message);
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error registering:', error);
            setError(error.message || 'Internal server error.');
        }
    };

    const handleUsernameChange = (event) => {
        setRegistrationUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setRegistrationPassword(event.target.value);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        registerUser();
    };

    const paperStyle = { padding: 20, width: 280, margin: "20px auto" }
    const avatarStyle = { backgroundColor: '#1bbd7e' }
    const btnstyle = { margin: '8px 0' }
    return (
        <Grid>
            <Paper elevation={10} style={paperStyle}>
            <form onSubmit={handleFormSubmit}>
                    <Grid align='center'>
                        <Avatar style={avatarStyle}><Person /></Avatar>
                        <h2>Register</h2>
                    </Grid>
                    <TextField
                        label='Username'
                        placeholder='Enter username'
                        fullWidth
                        required
                        value={registrationUsername}
                        onChange={handleUsernameChange}
                    />
                    <TextField
                        label='Password'
                        placeholder='Enter password'
                        type='password'
                        fullWidth
                        required
                        value={registrationPassword}
                        onChange={handlePasswordChange}
                    />
                    <Button type='submit' color='primary' variant='contained' style={btnstyle} fullWidth>
                        Register
                    </Button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}
                </form>
                <Grid container justifyContent="flex-center">
                    <Typography variant="body2">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </Typography>
                </Grid>
            </Paper>
        </Grid>
    )
}

export default Register