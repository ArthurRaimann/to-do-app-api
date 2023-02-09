import mongoose from 'mongoose';

// export const Task = mongoose.model('Task', {
//   completed: { type: Boolean, required: false, default: false },
//   description: { type: String, required: true, trim: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
// });

const taskSchema = new mongoose.Schema(
  {
    completed: { type: Boolean, required: false, default: false },
    description: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model('Task', taskSchema);
