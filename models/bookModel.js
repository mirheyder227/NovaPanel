import { getDb } from '../database/db.js';

export const searchBooks = async (query) => {
    const db = getDb();
    return db.all(
        'SELECT * FROM books WHERE title LIKE ? COLLATE NOCASE',
        [`%${query}%`]
    );
};