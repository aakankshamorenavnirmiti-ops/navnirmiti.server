const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title:    { type: String, required: [true, 'Title is required'], trim: true },
  excerpt:  { type: String, required: [true, 'Excerpt is required'], trim: true },
  content:  { type: String, required: [true, 'Content is required'] },
  author:   { type: String, required: [true, 'Author is required'], trim: true, default: 'Er. Ramchandra P. More' },
  category: { type: String, required: [true, 'Category is required'], trim: true },
  tags:     [{ type: String, trim: true }],
  image:    { type: String, default: null },   // filename stored in /uploads/
  readTime: { type: String, default: '5 min read' },
  date:     { type: Date, default: Date.now },
  published:{ type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
