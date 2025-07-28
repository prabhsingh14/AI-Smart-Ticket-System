import express from 'express';
import { createTicket, getTickets, getTicket, getSimilarTickets } from '../controllers/ticket.controller.js';
import { authenticate } from '../middlewares/user.middleware.js';

const router = express.Router();

router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.get("/similar", authenticate, getSimilarTickets);

export default router