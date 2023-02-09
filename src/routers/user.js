import express from 'express';
import { User } from '../models/user.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import sharp from 'sharp';
import { sendWelcomeEmail, sendCancelationEmail } from '../emails/account.js';

const router = new express.Router();
const upload = multer({
  limits: {
    fileSize: 1 * 1_000_000, // size in MB
  },
  fileFilter(_req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error('Please upload an image file which is on of: jpg, jpeg, png')
      );
    }

    cb(undefined, true);
    //cb(undefined, false) // silently rejection
  },
});

// sign up
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send();
  }

  // with promis chaining
  // user
  //   .save()
  //   .then(() => {
  //     res.status(201).send(user);
  //   })
  //   .catch((e) => {
  //     res.status(400).send(e);
  //   });
});

// login
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    //const publicUser = await user.getPublicProfile();

    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// get user profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// User.find({})
//   .then((users) => {
//     res.send(users);
//   })
//   .catch((e) => {
//     res.status(500).send();
//   });

// router.get('/users/:id', async (req, res) => {
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (error) {
//     res.status(500).send();
//   }
// });
// User.findById(_id)
//   .then((user) => {
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   })
//   .catch((e) => {
//     res.status(500).send(e);
//   });

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValid = updates.every((update) => allowedUpdates.includes(update));

  if (!isValid) {
    return res.status(400).send({ error: 'invalid update' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send();
    // }

    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Upload a profile picture: first middleware for authetication, then middleware for upload, then sending the response and finally the error handling in case the upload fails
router.post(
  '/users/me/avatar',
  auth,
  upload.single('upload'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

export default router;
