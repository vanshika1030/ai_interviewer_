import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const ResponseEvaluationSchema = new mongoose.Schema({
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  communication: {
    type: Number,
    min: 0,
    max: 10,
  },
  relevance: {
    type: Number,
    min: 0,
    max: 10,
  },
  depth: {
    type: Number,
    min: 0,
    max: 10,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 10,
  },
  feedback: {
    type: String,
    default: '',
  },
}, { _id: false });

const ResponseSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  chunks: {
    type: [ChunkSchema],
    default: [],
  },
  chunksReceived: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'recording', 'uploaded', 'transcribed', 'evaluated'],
    default: 'pending',
  },
  mergedMediaUrl: {
    type: String,
    default: '',
  },
  mergedFile: {
    type: String,
    default: '',
  },
  transcript: {
    type: String,
    default: '',
  },
  transcriptConfidence: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 0,
  },
  evaluation: {
    type: ResponseEvaluationSchema,
    default: () => ({}),
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
}, { _id: true });

const SuspiciousEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: String,
    default: '',
  },
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: [true, 'Interview ID is required'],
    index: true,
  },
  candidateName: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    minlength: [2, 'Candidate name must be at least 2 characters'],
    maxlength: [100, 'Candidate name cannot exceed 100 characters'],
  },
  candidateEmail: {
    type: String,
    required: [true, 'Candidate email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'evaluated', 'abandoned'],
      message: '{VALUE} is not a valid session status',
    },
    default: 'pending',
  },
  chunksReceived: {
    type: Number,
    default: 0,
  },
  session_data: {
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    lastHeartbeat: {
      type: Date,
    },
    chunksReceived: {
      type: Number,
      default: 0,
    },
    resumeCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  responses: {
    type: [ResponseSchema],
    default: [],
  },
  proctoring: {
    tabSwitchCount: {
      type: Number,
      default: 0,
    },
    faceAbsenceCount: {
      type: Number,
      default: 0,
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    terminated: {
      type: Boolean,
      default: false,
    },
    terminationReason: {
      type: String,
      default: '',
    },
    faceDetectionRate: {
      type: Number,
      default: 100,
    },
    events: {
      type: [{
        type: { type: String, required: true },
        message: { type: String, default: '' },
        severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        timestamp: { type: Date, default: Date.now },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
      }],
      default: [],
    },
    suspiciousEvents: {
      type: [SuspiciousEventSchema],
      default: [],
    },
  },
  evaluation: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    communicationAvg: {
      type: Number,
      min: 0,
      max: 10,
    },
    relevanceAvg: {
      type: Number,
      min: 0,
      max: 10,
    },
    depthAvg: {
      type: Number,
      min: 0,
      max: 10,
    },
    confidenceAvg: {
      type: Number,
      min: 0,
      max: 10,
    },
    aiSummary: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    evaluatedAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

SessionSchema.index({ interviewId: 1, candidateEmail: 1 });
SessionSchema.index({ status: 1 });
SessionSchema.index({ candidateEmail: 1 });

const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

export default Session;
