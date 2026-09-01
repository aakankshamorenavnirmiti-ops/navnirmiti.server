const mongoose = require('mongoose');

/**
 * One ClientProject document per client (one-to-one).
 * Tracks the 4 pipeline stages + in-progress gallery.
 *
 * Stage progression:
 *   plan       → done when planPdf is set
 *   agreement  → done when agreementPdf is set
 *   inProgress → active once agreement is done, until completionImage is set
 *   completion → done when completionImage is set
 */
const clientProjectSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true          // one project per client
  },

  projectTitle: { type: String, trim: true, default: 'My Project' },

  // Stage 1 — Plan
  planPdf: { type: String, default: null },         // filename in /uploads/
  planUploadedAt: { type: Date, default: null },

  // Stage 2 — Agreement
  agreementPdf: { type: String, default: null },
  agreementUploadedAt: { type: Date, default: null },

  // Stage 4 — Completion
  completionImage: { type: String, default: null },  // filename in /uploads/
  completionUploadedAt: { type: Date, default: null },

  // In-progress gallery (Stage 3 content)
  progressImages: [{
    filename:   { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    caption:    { type: String, default: '' }
  }],

  adminNotes: { type: String, default: '' }

}, { timestamps: true });

/* Virtual: compute current stage */
clientProjectSchema.virtual('currentStage').get(function () {
  if (this.completionImage) return 'completion';
  if (this.agreementPdf)    return 'inProgress';
  if (this.planPdf)         return 'agreement';
  return 'plan';
});

clientProjectSchema.set('toJSON',   { virtuals: true });
clientProjectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ClientProject', clientProjectSchema);
