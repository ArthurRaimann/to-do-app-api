import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import { expect, jest, test } from '@jest/globals';
import { User } from '../src/models/user.js';
import sgMail from '@sendgrid/mail';
import { userOne, userOneId, setUpDatabase } from './fixtures/db.js';

beforeEach(async () => {
  await setUpDatabase();
  jest.spyOn(sgMail, 'setApiKey').mockReturnValue();
  jest.spyOn(sgMail, 'send').mockReturnValue();
});

afterAll(async () => {
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close();
});

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Art',
      email: 'araimann25@gmail.com',
      password: '12345678',
    })
    .expect(201);
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: 'Art',
      email: 'araimann25@gmail.com',
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe('12345678');
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'fail@fail.com',
      password: '12345678',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for not authenticated User', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(response.body._id);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user field', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'TestName' })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe('TestName');
});

test('Should not update novalid user field', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ nonexistingField: 'no' })
    .expect(400);
});
