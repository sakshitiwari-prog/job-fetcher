import mongoose from "mongoose";

const ImportLogSchema = new mongoose.Schema({
  filename: [String], 
  sourceCount: { type: Number, default: 0 }, 
  totalFetched: { type: Number, default: 0 }, 
  validJobs: { type: Number, default: 0 }, 
  invalidJobs: { type: Number, default: 0 }, 
  queued: { type: Number, default: 0 }, 
  totalProcessed: { type: Number, default: 0 }, 
  newJobs: { type: Number, default: 0 },
  updatedJobs: { type: Number, default: 0 }, 
  skippedJobs: { type: Number, default: 0 },
  failedJobs: { type: Number, default: 0 }, 
  
  failures: [
    {
      guid: String,
      job: String,
      reason: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  startedAt: { type: Date, default: Date.now },
  finishedAt: Date,
  
  duration: Number, 
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

ImportLogSchema.pre('save', function(next) {
  if (this.finishedAt && this.startedAt) {
    this.duration = this.finishedAt - this.startedAt;
  }
  next();
});

ImportLogSchema.index({ createdAt: -1 });
ImportLogSchema.index({ status: 1, createdAt: -1 });

ImportLogSchema.virtual('successRate').get(function() {
  if (this.totalProcessed === 0) return 0;
  const successful = this.newJobs + this.updatedJobs;
  return ((successful / this.totalProcessed) * 100).toFixed(2);
});

ImportLogSchema.set('toJSON', { virtuals: true });
ImportLogSchema.set('toObject', { virtuals: true });

const ImportLog = mongoose.model("ImportLog", ImportLogSchema);
export default ImportLog;