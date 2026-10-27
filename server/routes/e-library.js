const express = require('express');
const path = require('path');
const downloadEBooks = require('../utils/eBooksInstall');
require('dotenv').config();

function ELibraryRouter() {
    const router = express.Router();
    
    
    router.get('/e-library/:bookName', async (req, res) => {
        console.log('requested e-book call for bookName:', req.params.bookName);
        try {
            const { bookName } = req.params;
            if (!/^[a-zA-Z0-9_-]+$/.test(bookName)) {
                return res.status(400).json({ error: 'Invalid bookName', ok: false });
            }
            await downloadEBooks(bookName);
            return res.status(200).sendFile(path.join(__dirname, '../EBooks', 'dist', 'index.html'));
        } catch (error) {
            console.error('E-library error:', error);
            if (error.code === 'BOOK_NOT_FOUND') {
                return res.status(404).json({ error: 'E-book not found', ok: false });
            }
            return res.status(500).json({ error: 'Internal server error', ok: false });
        }
    });

    router.use('/e-library/:bookName', (req, res, next) => {
        const { bookName } = req.params;
        if (!/^[a-zA-Z0-9_-]+$/.test(bookName)) {
            return res.status(400).json({ error: 'Invalid bookName', ok: false });
        }

        return express.static(path.join(__dirname, '../EBooks', 'dist'), {
            setHeaders: response => {
                response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            }
        })(req, res, next);
    });

    return router;
}

module.exports = ELibraryRouter;