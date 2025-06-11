import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './lib/db.js';
import { server } from './lib/socket.js';
import authRouter from './routes/authRoute.js';
import messageRouter from './routes/messageRoute.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/messages', messageRouter);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on PORT ${process.env.PORT}`);
    connectDB();
})