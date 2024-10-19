import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadImages, processImage } from '../middleware/uploadCard.js';
import { createCard, deleteCard, updateCard } from '../controllers/mutation/card.mutation.js';
import { getAllCards, getAvailableCards } from '../controllers/query/card_query.js';

const cardRouter = express.Router();

//TODO: Add auth here to verify the token
cardRouter.post('/create', uploadImages, processImage, createCard);
cardRouter.put('/update/:id', adminAuth, updateCard);
cardRouter.put('/delete/:id', adminAuth, deleteCard);

cardRouter.get('/available', getAvailableCards)
cardRouter.get('/all', adminAuth, getAllCards);

cardRouter.delete('/:id', adminAuth, deleteCard)

export default cardRouter;