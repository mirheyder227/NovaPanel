


// server/routes/book.js (Kitab marşrutları - əlavə olunub)
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bütün kitabları gətir
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const books = await db.all('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Kitabları gətirərkən xəta:', error);
        res.status(500).json({ message: 'Kitablar gətirilərkən server xətası baş verdi.' });
    }
});

// Yeni kitab əlavə et (yalnız admin)
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const { title, author, genre } = req.body;
            if (!title) {
                return res.status(400).json({ message: 'Kitabın adı tələb olunur.' });
            }
            const db = getDb();
            const result = await db.run(
                'INSERT INTO books (title, author, genre) VALUES (?, ?, ?)',
                [title, author, genre]
            );
            res.status(201).json({ message: 'Kitab uğurla əlavə edildi.', bookId: result.lastID });
        } catch (error) {
            console.error('Kitab əlavə edilərkən xəta:', error);
            res.status(500).json({ message: 'Kitab əlavə edilərkən server xətası baş verdi.' });
        }
    }
);

// Kitabı ID-yə görə gətir
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();
        const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
        if (!book) {
            return res.status(404).json({ message: 'Kitab tapılmadı.' });
        }
        res.json(book);
    } catch (error) {
        console.error('Tək kitabı gətirərkən xəta:', error);
        res.status(500).json({ message: 'Kitab gətirilərkən server xətası baş verdi.' });
    }
});

// Kitabı yenilə (yalnız admin)
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { title, author, genre } = req.body;
            const db = getDb();

            const existingBook = await db.get('SELECT id FROM books WHERE id = ?', [id]);
            if (!existingBook) {
                return res.status(404).json({ message: 'Kitab tapılmadı.' });
            }

            let updateFields = [];
            let updateValues = [];

            if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
            if (author !== undefined) { updateFields.push('author = ?'); updateValues.push(author); }
            if (genre !== undefined) { updateFields.push('genre = ?'); updateValues.push(genre); }

            if (updateFields.length === 0) {
                const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
                return res.status(200).json({ message: 'Yeniləmə üçün heç bir sahə təmin edilməyib.', book: updatedBook });
            }

            const query = `UPDATE books SET ${updateFields.join(', ')} WHERE id = ?`;
            updateValues.push(id);

            const result = await db.run(query, updateValues);

            if (result.changes === 0) {
                const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
                return res.status(200).json({ message: 'Kitab tapıldı, lakin məlumatlarda dəyişiklik olmadığı üçün yenilənmədi.', book: updatedBook });
            }

            const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
            res.status(200).json({ message: 'Kitab uğurla yeniləndi.', book: updatedBook });

        } catch (error) {
            console.error('Kitabı yeniləyərkən xəta:', error);
            res.status(500).json({ message: 'Kitab yenilənərkən server xətası baş verdi.' });
        }
    }
);

// Kitabı sil (yalnız admin)
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const db = getDb();
            const result = await db.run('DELETE FROM books WHERE id = ?', [id]);

            if (result.changes === 0) {
                return res.status(404).json({ message: 'Kitab tapılmadı.' });
            }
            res.status(200).json({ message: 'Kitab uğurla silindi.' });
        } catch (error) {
            console.error('Kitabı silərkən xəta:', error);
            res.status(500).json({ message: 'Kitab silinərkən server xətası baş verdi.' });
        }
    }
);

export default router;