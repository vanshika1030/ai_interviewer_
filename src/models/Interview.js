import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [2000, 'Question text cannot exceed 2000 characters'],
  },
  timeLimit: {
    type: Number,
    default: 120,
    min: [15, 'Time limit must be at least 15 seconds'],
    max: [600, 'Time limit cannot exceed 600 seconds'],
  },
  category: {
    type: String,
    enum: {
      values: ['technical', 'behavioral', 'situational', 'general'],
      message: '{VALUE} is not a valid category',
    },
    default: 'general',
  },
  order: {
    type: Number,
  },
}, { _id: true });

const InterviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Interview title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: '',
  },
  questions: {
    type: [QuestionSchema],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'Interview must have at least one question',
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  settings: {
    maxDuration: {
      type: Number,
      default: 1800,
      min: [60, 'Max duration must be at least 60 seconds'],
      max: [7200, 'Max duration cannot exceed 7200 seconds'],
    },
    proctoringEnabled: {
      type: Boolean,
      default: true,
    },
    allowResume: {
      type: Boolean,
      default: true,
    },
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'archived'],
      message: '{VALUE} is not a valid status',
    },
    default: 'active',
  },
  candidateCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

InterviewSchema.index({ createdBy: 1 });
InterviewSchema.index({ status: 1 });

const Interview = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);

export default Interview;
