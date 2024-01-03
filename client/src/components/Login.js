import React, { useState, useEffect } from 'react';
import { Grid, Paper, Avatar, TextField, Button, Typography } from '@mui/material'
import { Person } from '@mui/icons-material';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";




const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { currentUser, login } = useAuth();


    const loginUser = async () => {
        try {
            setError("");
            setLoading(true);
            await login(username, password);
            setLoading(false);
            // navigate("/");
        } catch (e) {
            setLoading(false);
            setError("Failed to login");
        }
    };
    

    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);
    
    useEffect(() => {
        if (!loading && currentUser) {
            navigate("/");
        }
    }, [loading, currentUser, navigate]);

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        loginUser();
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
                        <h2>Sign In</h2>
                    </Grid>
                    <TextField
                        label='Username'
                        placeholder='Enter username'
                        fullWidth
                        required
                        value={username}
                        onChange={handleUsernameChange}
                    />
                    <TextField
                        label='Password'
                        placeholder='Enter password'
                        type='password'
                        fullWidth
                        required
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <Button type='submit' color='primary' variant='contained' style={btnstyle} fullWidth>
                        Sign in
                    </Button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
                <Grid container justifyContent="flex-center">
                    <Typography variant="body2">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </Typography>
                </Grid>
            </Paper>
        </Grid>
    )
}

export default Login