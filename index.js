import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/userRouter.js';
import { accountRouter } from './routes/accountRouter.js';
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT;


const app = express();
app.use(express.json());
const corsOptions = {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, 
};  
app.use(cors(corsOptions));
app.use('/api/v1/user', userRouter);
app.use('/api/v1/account', accountRouter);

app.listen(port);