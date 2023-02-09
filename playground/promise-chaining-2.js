import MongooseClient from '../src/db/mongoose.js';
import { Task } from '../src/models/task.js';

const mongooseClient = new MongooseClient();
mongooseClient.connect();

// Task.findByIdAndDelete('63cf6d536d80fa997c898609')
//   .then((task) => {
//     console.log(task);
//     return Task.countDocuments({ completed: false });
//   })
//   .then((tasks) => {
//     console.log(tasks);
//     process.exit(0);
//   })
//   .catch((e) => {
//     console.log(e);
//     process.exit(1);
//   });

const deleteTaskAndCount = async (id) => {
  await Task.findByIdAndDelete(id);
  const count = Task.countDocuments({ completed: false });

  return count;
};

deleteTaskAndCount('63cf6d536d80fa997c898609')
  .then((count) => {
    console.log(count);
    process.exit(0);
  })
  .catch((e) => console.log(e));
