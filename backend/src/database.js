const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let dbInstance = null;
let SQL = null;

async function initDatabase() {
  if (dbInstance) return dbInstance;
  
  if (!SQL) {
    SQL = await initSqlJs();
  }
  
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/feedback.db');
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Load existing database or create new
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(fileBuffer);
    } else {
      dbInstance = new SQL.Database();
    }
  } catch (err) {
    dbInstance = new SQL.Database();
  }
  
  // Create feedback table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Anonymous',
      email TEXT,
      message TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes
  dbInstance.run(`
    CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating)
  `);
  dbInstance.run(`
    CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC)
  `);
  
  // Save database to disk
  saveDatabase(dbPath);
  
  return dbInstance;
}

function saveDatabase(dbPath) {
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

class FeedbackModel {
  constructor(db) {
    this.db = db;
  }
  
  create({ name, email, message, rating }) {
    this.db.run(
      'INSERT INTO feedback (name, email, message, rating) VALUES (?, ?, ?, ?)',
      [name, email, message, rating]
    );
    
    // Get the last inserted ID
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    
    return this.findById(id);
  }
  
  findById(id) {
    const result = this.db.exec(
      'SELECT * FROM feedback WHERE id = ' + id
    );
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const feedback = {};
    columns.forEach((col, idx) => {
      feedback[col] = values[idx];
    });
    
    return feedback;
  }
  
  findAll({ rating, limit = 100, offset = 0 } = {}) {
    let query = 'SELECT * FROM feedback';
    const conditions = [];
    
    if (rating) {
      conditions.push('rating = ' + rating);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const result = this.db.exec(query);
    
    if (result.length === 0) {
      return [];
    }
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const feedback = {};
      columns.forEach((col, idx) => {
        feedback[col] = values[idx];
      });
      return feedback;
    });
  }
  
  getStats() {
    // Total count
    const totalResult = this.db.exec('SELECT COUNT(*) as total FROM feedback');
    const total = totalResult[0]?.values[0][0] || 0;
    
    // Average rating
    const avgResult = this.db.exec('SELECT AVG(rating) as avg_rating FROM feedback');
    const avgRating = avgResult[0]?.values[0][0] || 0;
    
    // Rating distribution
    const distResult = this.db.exec(`
      SELECT rating, COUNT(*) as count
      FROM feedback
      GROUP BY rating
      ORDER BY rating
    `);
    
    const byRating = [];
    if (distResult.length > 0) {
      distResult[0].values.forEach(row => {
        byRating.push({
          rating: row[0],
          count: row[1]
        });
      });
    }
    
    // Ensure all ratings 1-5 are represented
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
      const found = byRating.find(item => item.rating === rating);
      return {
        rating,
        count: found ? found.count : 0
      };
    });
    
    return {
      total,
      averageRating: avgRating ? parseFloat(avgRating).toFixed(2) : 0,
      ratingDistribution
    };
  }
  
  delete(id) {
    this.db.run('DELETE FROM feedback WHERE id = ' + id);
    const result = this.db.exec('SELECT changes()');
    return result[0]?.values[0][0] > 0;
  }
}

module.exports = { initDatabase, FeedbackModel, saveDatabase };
