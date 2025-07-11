// server/routes/book.js
import express from 'express';
import { getSearchResults } from '../controllers/bookController.js'; // bookController-i yaradırsınızsa

const router = express.Router();

router.get('/search', getSearchResults); // /api/books/search

export default router;