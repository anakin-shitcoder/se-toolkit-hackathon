const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/feedback.json');

function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDB() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { feedback: [], nextId: 1 };
  }
}

function saveDB(db) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

class FeedbackModel {
  create({ name, email, message, rating }) {
    const db = loadDB();
    const feedback = {
      id: db.nextId++,
      name: name || 'Anonymous',
      email: email || null,
      message,
      rating,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.feedback.push(feedback);
    saveDB(db);
    return feedback;
  }

  findById(id) {
    const db = loadDB();
    return db.feedback.find(f => f.id === parseInt(id)) || null;
  }

  findAll({ rating, limit = 100, offset = 0 } = {}) {
    const db = loadDB();
    let items = [...db.feedback];

    if (rating) {
      items = items.filter(f => f.rating === parseInt(rating));
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return items.slice(offset, offset + limit);
  }

  getStats() {
    const db = loadDB();
    const items = db.feedback;
    const total = items.length;
    const avgRating = total > 0
      ? (items.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(2)
      : '0.00';

    const ratingDistribution = [1, 2, 3, 4, 5].map(r => ({
      rating: r,
      count: items.filter(f => f.rating === r).length
    }));

    return { total, averageRating: avgRating, ratingDistribution };
  }

  delete(id) {
    const db = loadDB();
    const idx = db.feedback.findIndex(f => f.id === parseInt(id));
    if (idx === -1) return false;
    db.feedback.splice(idx, 1);
    saveDB(db);
    return true;
  }
}

// Synchronous init
function initDatabase() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    saveDB({ feedback: [], nextId: 1 });
  }
  return new FeedbackModel();
}

module.exports = { initDatabase, FeedbackModel, saveDatabase: () => {} };
