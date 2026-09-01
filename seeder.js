const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');
const Blog = require('./models/Blog');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read JSON files
const projects = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/projects.json`, 'utf-8')
);

const blogs = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/blogs.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Project.create(projects);
    await Blog.create(blogs);
    await User.create(users);
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Project.deleteMany();
    await Blog.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}