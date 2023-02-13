import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

import { Task } from '../src/models/task.js';
import { userOne, userTwo, taskOne, setUpDatabase } from './fixtures/db.js';
import { expect } from '@jest/globals';

beforeEach(async () => {
  await setUpDatabase();
});

afterAll(async () => {
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close();
});

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/task')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Test task',
    })
    .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test('Should return all tasks for userOne', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toBe(2);
});

test('Should not delete other users tasks', async () => {
  await request(app)
    .delete(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const taskOneFromUserOne = await Task.findById(taskOne._id);
  expect(taskOneFromUserOne).not.toBeNull();
});
