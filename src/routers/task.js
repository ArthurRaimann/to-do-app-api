import express from 'express';
import { Task } from '../models/task.js';
import auth from '../middleware/auth.js';

const router = new express.Router();

router.post('/task', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send();
  }

  // task
  //   .save()
  //   .then(() => {
  //     res.status(201).send(task);
  //   })
  //   .catch((e) => {
  //     res.status(400).send(e);
  //   });
});

// GET /tasks?completed=true will give you only completed tasks
// GET /tasks?limt=10&skip=0 will return the first 10 entries
// Get /task?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  try {
    const match = { owner: req.user._id };
    const sort = {};

    const isCompletedSet = req.query?.completed;
    const limit = req.query?.limit;
    const skip = req.query?.skip;

    if (req.query?.sortBy) {
      const parts = req.query?.sortBy.split(':');

      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    if (isCompletedSet) {
      let completed;
      isCompletedSet === 'true' ? (completed = true) : (completed = false);
      match.completed = completed;
    }

    const tasks = await Task.find({
      ...match,
    })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort(sort);

    if (!tasks) {
      res.status(404).send();
    }
    res.send(tasks);
  } catch (error) {
    res.status(500).send();
  }

  // Task.find({})
  //   .then((tasks) => {
  //     res.send(tasks);
  //   })
  //   .catch((e) => {
  //     res.status(500).send(e);
  //   });
});

router.get('/task/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }

  // Task.findById(_id)
  //   .then((task) => {
  //     if (!task) {
  //       return res.status(404).send();
  //     }
  //     res.send(task);
  //   })
  //   .catch((e) => {
  //     res.status(500).send(e);
  //   });
});

router.patch('/task/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedTaskProps = ['completed', 'description'];
  const isTaskValid = updates.every((update) =>
    allowedTaskProps.includes(update)
  );

  if (!isTaskValid) {
    return res.status(400).send({ error: 'invalid update' });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/task/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
