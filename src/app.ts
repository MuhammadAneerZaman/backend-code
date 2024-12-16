import express from "express";
import createHttpError from "http-errors";
import cors from 'cors';
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRoutes";
import bookRouter from "./book/bookRoutes";
import { config } from "./config/config";


const app = express();
app.use(express.json());
app.use(cors({
    origin:config.cors_origin
}))

app.get('/', (req, res) => {
    const error = createHttpError(400, "Something went wrong")
    throw error
    res.json({message:"Welcome to elib Technologies"});
});


app.use('/api/users',userRouter);
app.use('/api/books', bookRouter);

// Global error handler

app.use(globalErrorHandler)

export default app;