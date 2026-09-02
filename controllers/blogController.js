const Blog = require('../models/Blog');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all blog posts
//          Public: only published. Admin (Bearer token present): all.
// @route   GET /api/blog
// @access  Public / Admin
exports.getBlogPosts = asyncHandler(async (req, res) => {
  // If a Bearer token is present treat as admin and return all posts
  const isAdmin = !!(req.headers.authorization && req.headers.authorization.startsWith('Bearer'));
  const filter  = isAdmin ? {} : { published: true };
  const posts   = await Blog.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: posts.length, data: posts });
});

// @desc    Get blog posts by category (published only)
// @route   GET /api/blog/category/:category
// @access  Public
exports.getBlogPostsByCategory = asyncHandler(async (req, res) => {
  const posts = await Blog.find({ category: req.params.category, published: true }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: posts.length, data: posts });
});

// @desc    Get single blog post by ID
// @route   GET /api/blog/:id
// @access  Public (only published)
exports.getBlogPost = asyncHandler(async (req, res) => {
  const post = await Blog.findById(req.params.id);
  if (!post)        return res.status(404).json({ success: false, error: 'Blog post not found' });
  if (!post.published) return res.status(403).json({ success: false, error: 'This post is not published' });
  res.status(200).json({ success: true, data: post });
});

// @desc    Create a new blog post (with optional image upload)
// @route   POST /api/blog
// @access  Private/Admin
exports.createBlogPost = asyncHandler(async (req, res) => {
  // multer sets req.file when an image is uploaded
  if (req.file) req.body.image = req.file.path;
  // Convert string 'true'/'false' from FormData to boolean
  if (typeof req.body.published === 'string') {
    req.body.published = req.body.published === 'true';
  }
  const post = await Blog.create(req.body);
  res.status(201).json({ success: true, data: post });
});

// @desc    Update a blog post (with optional new image)
// @route   PUT /api/blog/:id
// @access  Private/Admin
exports.updateBlogPost = asyncHandler(async (req, res) => {
  if (req.file) req.body.image = req.file.path;
  if (typeof req.body.published === 'string') {
    req.body.published = req.body.published === 'true';
  }
  req.body.updatedAt = Date.now();
  const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ success: false, error: 'Blog post not found' });
  res.status(200).json({ success: true, data: post });
});

// @desc    Delete a blog post
// @route   DELETE /api/blog/:id
// @access  Private/Admin
exports.deleteBlogPost = asyncHandler(async (req, res) => {
  const post = await Blog.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Blog post not found' });
  res.status(200).json({ success: true, data: {} });
});
