const jwt = require('jsonwebtoken');
const { decryptToken } = require('../utils/Encryption');

function createAuthenticateToken(getSecretKey) {
    return async function authenticateToken(req, res, next) {
        let token = req.header('Authorization');
        if (token && token.startsWith('Bearer ')) {
            token = token.replace('Bearer ', '');
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Token missing', credentials: false });
        }

        try {
            const decodedToken = await decryptToken({ action: 'decrpyt', token });
            const decoded = jwt.verify(decodedToken, getSecretKey());
            req.user = decoded;
            next();
        } catch (ex) {
            return res.status(401).json({ error: 'Invalid token', credentials: false });
        }
    };
}

module.exports = { createAuthenticateToken };
