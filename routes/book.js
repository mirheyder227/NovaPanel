import express from 'express';
import { getSearchResults } from '../controllers/bookController.js';

const router = express.Router();

router.get('/books/search', getSearchResults);

export default router;