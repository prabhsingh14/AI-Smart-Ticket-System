import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import { serve } from inngest/express;
import { inngest } from './inngest/client.js';
import { onSignup } from './inngest/functions/on-signup.js';
import { onTicketCreated } from './inngest/functions/on-ticket-creation.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions: [onSignup, onTicketCreated],
    })
)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    })
    .catch(
    (error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
)