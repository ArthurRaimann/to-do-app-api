import express from 'express';
import mongoose from 'mongoose';

import userRouter from './routers/user.js';
import taskRouter from './routers/task.js';

const MONGO_API_KEY =
  process.env.MONGO_API_KEY || 'mongodb://127.0.0.1:27017/task-manager-api';

mongoose.connect(MONGO_API_KEY);
const app = express();

// app.use((req, res, next) => {
//   if (req.method === 'GET') {
//     res.send('Get requests are disabled');
//   } else {
//     next();
//   }
// });

// app.use((req, res, next) => {
//   res.status(503).send('Server is under maintenance');
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

export default app;
