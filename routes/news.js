import express from 'express';
import { getEconomicNews, getITNews, getNews, getPolicyNews } from '../controllers/news.js';

const router = express.Router();

/* Send Email*/
// Get News
router.get("/get", getNews);
// Get Politics News
router.get("/policy/get", getPolicyNews);
// Get Economy News
router.get("/economy/get", getEconomicNews);
// Get IT News
router.get("/it/get", getITNews);

export default router;