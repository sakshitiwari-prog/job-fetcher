import mongoose from "mongoose";
import crypto from "crypto";

const JobSchema = new mongoose.Schema({
  guid: { 
    type: String, 
    index: true, 
    required: true,
    unique: true 
  },
  title: String,
  description: String,
  location: String,
  company: String,
  url: String,
  raw: Object, 
  source: String,
  
  contentHash: { 
    type: String, 
    index: true
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

JobSchema.pre('save', function(next) {
  if (this.isModified() && this.isNew) {
    this.contentHash = this.generateContentHash();
  }
  next();
});

JobSchema.methods.generateContentHash = function() {
  const content = JSON.stringify({
    title: this.title,
    description: this.description,
    location: this.location,
    company: this.company,
    url: this.url,
    raw: this.raw,
  });
  
  return crypto.createHash('md5').update(content).digest('hex');
};

JobSchema.index({ guid: 1, contentHash: 1 });
JobSchema.index({ source: 1, updatedAt: -1 });
JobSchema.index({ createdAt: -1 });

const Job = mongoose.model("Job", JobSchema);
export default Job;