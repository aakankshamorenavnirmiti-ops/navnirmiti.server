const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question:      { type: String, required: true, trim: true },
  options:       [{ type: String, required: true, trim: true }], // exactly 4 options
  correctIndex:  { type: Number, required: true, min: 0, max: 3 }, // index of correct option
  explanation:   { type: String, trim: true, default: '' }        // shown after answer
});

const trainingModuleSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  content:     { type: String, required: true },  // full module theory text/HTML
  order:       { type: Number, default: 0 },       // display order
  duration:    { type: String, default: '30 min' },// e.g. "45 min"
  published:   { type: Boolean, default: true },
  quiz:        [quizQuestionSchema],               // quiz attached to this module
  passMark:    { type: Number, default: 60, min: 0, max: 100 } // % to pass
}, { timestamps: true });

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);
