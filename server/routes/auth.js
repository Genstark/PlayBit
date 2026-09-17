const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { encryptToken } = require('../utils/Encryption');
const { createAuthenticateToken } = require('../middleware/authenticateToken');

function createAuthRouter({ client, getSecretKey }) {
    const router = express.Router();
    const authenticateToken = createAuthenticateToken(getSecretKey);
    const users = () => client.db('E-Learning').collection('users');

    router.get('/validate-token', authenticateToken, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Invalid token', ok: false });
            }
            return res.status(200).json({ message: 'Token is valid', ok: true, user: req.user });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error', ok: false });
        }
    });

    router.post('/reset-email', async (req, res) => {
        if (req.body.task === 'confirmation') {
            const { userName, userEmail } = req.body;
            const user = await users().findOne({ name: userName, email: userEmail });
            if (!user) {
                return res.status(400).json({ error: 'User not found', ok: false });
            }
            return res.status(200).json({ message: 'got the message', ok: true, userName: user.name, userEmail: user.email });
        }

        if (req.body.task === 'resetEmail') {
            const { userEmail, confirmEmail } = req.body;
            try {
                await users().updateOne({ email: userEmail }, { $set: { email: confirmEmail } });
                return res.status(200).json({ message: 'Email updated successfully', ok: true });
            } catch (error) {
                console.error('Error updating email:', error);
                return res.status(500).json({ error: 'Internal server error', ok: false });
            }
        }
    });

    router.post('/reset-password', async (req, res) => {
        if (req.body.task === 'confirmation') {
            const { userEmail, userName } = req.body;
            const findEmail = await users().findOne({ email: userEmail });
            const findName = await users().findOne({ name: userName });
            if (!findEmail || !findName || findEmail.email !== findName.email) {
                return res.status(400).json({ error: 'User not found', ok: false });
            }
            return res.status(200).json({ message: 'got the message', ok: true, userEmail: findEmail.email, userName: findName.name });
        }

        if (req.body.task === 'resetPassword') {
            const { userEmail, confirmPassword } = req.body;
            try {
                const hashedPassword = await bcrypt.hash(confirmPassword, 10);
                await users().updateOne({ email: userEmail }, { $set: { password: hashedPassword } });
                return res.status(200).json({ message: 'Password reset successfully', ok: true });
            } catch (error) {
                console.error('Error resetting password:', error);
                return res.status(500).json({ error: 'Internal server error', ok: false });
            }
        }
    });

    router.post('/signup', async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        try {
            const existingUser = await users().findOne({ $or: [{ email }, { name }] });
            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(409).json({ error: 'Email already in use', ok: false });
                }
                if (existingUser.name === name) {
                    return res.status(409).json({ error: 'Username already in use', ok: false });
                }
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await users().insertOne({ name, email, password: hashedPassword });
            return res.status(200).json({ message: 'User created successfully', ok: true });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error', ok: false });
        }
    });

    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        try {
            const user = await users().findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            let token = jwt.sign({ email: user.email, username: user.name }, getSecretKey(), { expiresIn: '23h' });
            token = await encryptToken({ action: 'encrypt', token });
            res.cookie('token', token, { httpOnly: false, secure: true, sameSite: 'Strict', maxAge: 23 * 60 * 60 * 1000 });
            return res.status(200).json({ message: 'Login successful', ok: true, token, user: user.name });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}

module.exports = { createAuthRouter };
