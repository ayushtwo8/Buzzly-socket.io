import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import { initializeSocket } from './socket/socket.js';


// routes import
import authRoutes from "./api/routes/authRoutes.js"
import userRoutes from "./api/routes/userRoutes.js"
import conversationRoutes from "./api/routes/conversationRoutes.js"

// load env
dotenv.config();

// connect db
connectDB();

const app = express();
const server = http.createServer(app);

// initialize socket.io
const io = initializeSocket(server);


// middlewares
const allowedOrigins = process.env.FRONTEND_URLS.split(',');
console.log(allowedOrigins);
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/conversations', conversationRoutes);

// start
server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});