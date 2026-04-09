const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const { sendNotificationEmail } = require('./email');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Resolve frontend path relative to project root
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_DIR));

// Initialize database (synchronous)
const feedbackModel = initDatabase();

// --- API Routes ---

// Submit new feedback
app.post('/api/feedback', (req, res) => {
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
      const r = parseInt(rating);
      if (r >= 1 && r <= 5) filters.rating = r;
    }
    const feedbacks = feedbackModel.findAll({ ...filters, limit: parseInt(limit), offset: parseInt(offset) });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get feedback statistics
app.get('/api/stats', (req, res) => {
  try {
    res.json(feedbackModel.getStats());
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single feedback by ID
app.get('/api/feedback/:id', (req, res) => {
  try {
    const feedback = feedbackModel.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Delete feedback
app.delete('/api/feedback/:id', (req, res) => {
  try {
    const deleted = feedbackModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Feedback Collector server running on http://${HOST}:${PORT}`);
});

module.exports = app;
