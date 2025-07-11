// server/controllers/bookController.js
import { getDb } from '../database/db.js';

export const getSearchResults = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: 'Axtarış sorğusu (q) tələb olunur.' });
        }
        const db = getDb();
        const books = await db.all(
            'SELECT * FROM books WHERE title LIKE ? COLLATE NOCASE',
            [`%${query}%`]
        );
        res.json(books);
    } catch (error) {
        console.error('Axtarış xətası:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};