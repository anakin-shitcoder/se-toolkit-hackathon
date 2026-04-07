# Feedback Collector

A simple feedback collection system for small businesses (cafés, bakeries, repair shops) to track customer reviews and comments without complex tools.

![Feedback Form Screenshot](https://via.placeholder.com/600x300/0d6efd/ffffff?text=Feedback+Form+Screenshot)
![Dashboard Screenshot](https://via.placeholder.com/600x300/198754/ffffff?text=Dashboard+Screenshot)

---

## Context

### End Users
Small business owners (café owners, bakery managers, repair shop operators) who want to track customer feedback without complex tools.

### Problem
Customer feedback is scattered across verbal comments, social media DMs, and paper notes, making it hard to spot issues or praise systematically.

### Solution
A simple feedback collector where customers submit comments via a web form and the business owner sees them on a clean dashboard with statistics and filtering.

---

## Features

### ✅ Implemented

**Version 1 - Core Feature:**
- ✅ Customer feedback submission form with star rating (1-5 stars)
- ✅ Backend API with SQLite database
- ✅ Owner dashboard displaying all feedback (newest first)
- ✅ Responsive web interface with Bootstrap

**Version 2 - Additional Features:**
- ✅ Bar chart showing rating distribution (📊)
- ✅ Filter by rating (keeps newest first)
- ✅ Automatic email notifications for new feedback
- ✅ Statistics cards (total feedback, average rating, 5-star count)
- ✅ Docker support for easy deployment
- ✅ RESTful API with error handling

### 📋 Not Implemented
- [ ] Multi-language support
- [ ] Export to CSV/PDF
- [ ] Admin authentication
- [ ] Reply to feedback

---

## Usage

### For Customers
1. Open the Feedback Collector in your browser
2. Fill in the feedback form:
   - Name (optional)
   - Email (optional)
   - Star rating (1-5 stars, required)
   - Message (required)
3. Click "Submit Feedback"

### For Business Owners
1. Click "Dashboard" in the navigation
2. View statistics:
   - Total feedback count
   - Average rating
   - 5-star reviews count
3. See rating distribution in the bar chart
4. Filter feedback by rating using the dropdown
5. All feedback is sorted by newest first

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit new feedback |
| GET | `/api/feedback` | Get all feedback (optional: `?rating=1-5`) |
| GET | `/api/feedback/:id` | Get specific feedback |
| DELETE | `/api/feedback/:id` | Delete feedback |
| GET | `/api/stats` | Get statistics |

### Example: Submit Feedback
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great service!",
    "rating": 5
  }'
```

### Example: Get Feedback with Filter
```bash
curl http://localhost:3000/api/feedback?rating=5
```

---

## Deployment

### Prerequisites
- **OS:** Ubuntu 24.04 (or similar Linux distribution)
- **Required:** Docker and Docker Compose

### Step-by-Step Deployment

#### Option 1: Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd se-toolkit-hackathon
   ```

2. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your email settings if you want notifications
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

6. **Stop the application:**
   ```bash
   docker-compose down
   ```

#### Option 2: Manual Installation

1. **Install Node.js (v20+):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd se-toolkit-hackathon/backend
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Access the application:**
   Open `http://localhost:3000` in your browser

### Email Configuration (Optional)

To enable email notifications:

1. Copy `.env.example` to `.env` in the backend directory
2. Set `EMAIL_ENABLED=true`
3. Configure your SMTP settings:
   - `SMTP_HOST` - SMTP server (e.g., smtp.gmail.com)
   - `SMTP_PORT` - SMTP port (usually 587 for TLS)
   - `SMTP_USER` - Your email address
   - `SMTP_PASS` - Your email app password
   - `NOTIFICATION_EMAIL` - Where to send notifications

**Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

---

## Architecture

```
┌─────────────────────────────────────┐
│         Frontend (Browser)          │
│  ┌──────────────┐  ┌─────────────┐  │
│  │ Submit Form  │  │  Dashboard  │  │
│  └──────────────┘  └─────────────┘  │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
               ▼
┌──────────────────────────────────────┐
│      Backend (Node.js + Express)     │
│  ┌──────────────────────────────┐   │
│  │   API Routes & Controllers   │   │
│  └──────────────────────────────┘   │
│           │            │             │
│           ▼            ▼             │
│  ┌────────────┐  ┌──────────────┐   │
│  │  SQLite    │  │  Email       │   │
│  │  Database  │  │  Service     │   │
│  └────────────┘  └──────────────┘   │
└──────────────────────────────────────┘
```

### Tech Stack
- **Backend:** Node.js, Express
- **Database:** SQLite (via better-sqlite3)
- **Frontend:** HTML5, CSS3, JavaScript (Bootstrap 5)
- **Email:** Nodemailer
- **Containerization:** Docker, Docker Compose

---

## Project Structure

```
se-toolkit-hackathon/
├── backend/
│   ├── src/
│   │   ├── server.js       # Main server file
│   │   ├── database.js     # Database initialization and models
│   │   └── email.js        # Email notification service
│   ├── tests/
│   │   └── api.test.js     # API integration tests
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html          # Main HTML with form and dashboard
│   ├── css/
│   │   └── style.css       # Custom styles
│   └── js/
│       └── app.js          # Frontend JavaScript logic
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment variables template
└── README.md               # This file
```

---

## Testing

Run the test suite:

```bash
cd backend
npm install
npm test
```

The tests cover:
- ✅ Submitting valid feedback
- ✅ Validation of required fields
- ✅ Rating validation (1-5)
- ✅ Fetching all feedback
- ✅ Filtering by rating
- ✅ Statistics endpoint
- ✅ Feedback ordering (newest first)
- ✅ Deleting feedback
- ✅ Error handling

---

## License

MIT License - See LICENSE file for details

---

## Links

- **GitHub Repository:** [se-toolkit-hackathon](https://github.com/<your-username>/se-toolkit-hackathon)
- **Live Demo:** [Deployed Application](http://your-deployment-url.com)

---

**Built with ❤️ for small businesses**
