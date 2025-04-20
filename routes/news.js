import express from 'express';
import { getNews } from '../controllers/news.js';

const router = express.Router();

/* Send Email*/
router.get("/get", getNews);

export default router;