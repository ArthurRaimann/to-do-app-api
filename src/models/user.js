import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Task } from './task.js';

const userSchema = new mongoose.Schema(
  {
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is not valid');
        }
      },
    },
    name: { type: String, required: true, default: 'Anonymus', trim: true },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error(
            'Please provide a valid password that has more than 6 characters'
          );
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: { type: Buffer },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

// method on instance level user
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.tokens;
  delete userObject.password;
  delete userObject.avatar;

  return userObject;
};

// method on model level User
userSchema.statics.findByCredentials = async (email, pw) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(pw, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// hash the plain text pw before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// delete user tasks when user is removes
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

export const User = mongoose.model('User', userSchema);
