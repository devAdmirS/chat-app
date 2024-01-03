const request = require('supertest');
const express = require('express');
const app = express();
const authController = require('../controllers/authController');

app.use(express.json());

jest.mock('../models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

app.post('/register', authController.register);
app.post('/login', authController.login);

describe('Authentication Controller', () => {
    it('should throw invalid credentails error', async () => {
        jest.spyOn(authController, 'register').mockRejectedValue(new Error('Invalid credentials'));

        const response = await request(app)
            .post('/login')
            .send({ username: 'test', password: 'test' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'User registered successfully' });
    });


});
