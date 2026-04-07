const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, FeedbackModel, saveDatabase } = require('./database');
const { sendNotificationEmail } = require('./email');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

// Initialize database and start server
let feedbackModel;
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/feedback.db');

initDatabase().then(async (db) => {
  feedbackModel = new FeedbackModel(db);
  
  // Store db reference for saving
  app.locals.db = db;
  
  console.log(`Feedback Collector server running on http://localhost:${PORT}`);
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// API Routes

// Submit new feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;
    
    if (!message || !rating) {
      return res.status(400).json({ error: 'Message and rating are required' });
    }
    
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const feedback = feedbackModel.create({
      name: name || 'Anonymous',
      email: email || null,
      message,
      rating
    });
    
    // Save database to disk
    saveDatabase(dbPath);
    
    // Send email notification (non-blocking)
    if (process.env.EMAIL_ENABLED === 'true') {
      sendNotificationEmail(feedback).catch(err => {
        console.error('Failed to send notification email:', err);
      });
    }
    
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

// Get all feedback with optional filtering
app.get('/api/feedback', (req, res) => {
  try {
    const { rating, limit = 100, offset = 0 } = req.query;
    
    const filters = {};
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        filters.rating = ratingNum;
      }
    }
    
    const feedbacks = feedbackModel.findAll({
      ...filters,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get feedback statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = feedbackModel.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single feedback by ID
app.get('/api/feedback/:id', (req, res) => {
  try {
    const feedback = feedbackModel.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Delete feedback (for admin)
app.delete('/api/feedback/:id', (req, res) => {
  try {
    const deleted = feedbackModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Save database to disk
    saveDatabase(dbPath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  // Server listening started
});

module.exports = app;
