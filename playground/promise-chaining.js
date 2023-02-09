import MongooseClient from '../src/db/mongoose.js';
import { User } from '../src/models/user.js';

const mongooseClient = new MongooseClient();
mongooseClient.connect();

// User.findByIdAndUpdate('63ce2cc35b6307ce30079a45', { age: 100 })
//   .then((user) => {
//     console.log(user);
//     return User.countDocuments({ age: 100 });
//   })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

const updateAgeAndCount = async (id, age) => {
  const user = await User.findByIdAndUpdate(id, { age });
  const count = await User.countDocuments({ age });

  return { count, user };
};

updateAgeAndCount('63ce2cc35b6307ce30079a45', 220)
  .then((count) => {
    console.log(count);
    process.exit(0);
  })
  .catch((e) => console.log(e));
