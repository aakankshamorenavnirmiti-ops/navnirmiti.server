const express = require('express');
const router = express.Router();
const { 
  createApplication, 
  getApplications, 
  getApplication, 
  deleteApplication 
} = require('../controllers/careersController');

// POST a new career application
router.post('/', createApplication);

// GET all career applications (admin only)
router.get('/', getApplications);

// GET a single career application by ID (admin only)
router.get('/:id', getApplication);

// DELETE a career application (admin only)
router.delete('/:id', deleteApplication);

module.exports = router;