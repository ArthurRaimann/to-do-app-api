import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import userRouter from './routers/user.js';
import taskRouter from './routers/task.js';

const app = express();
dotenv.config();

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

const PORT = process.env.PORT || 3002;
const MONGO_API_KEY =
  process.env.MONGO_API_KEY || 'mongodb://127.0.0.1:27017/task-manager-api';

mongoose
  .connect(MONGO_API_KEY)
  .then(() =>
    app.listen(PORT, () => {
      console.log('Server is running on port: ' + PORT);
    })
  )
  .catch((error) => {
    console.log(error);
  });
