# Customer Feedback Portal

A comprehensive feedback management system for online services (SaaS platforms, streaming services, educational platforms) with NLP-powered sentiment analysis and data visualization.

## 🚀 Features

### Backend (Node.js/Express)
- ✅ RESTful API with CRUD operations
- 🤖 Keyword-based NLP sentiment analysis
- 📊 Real-time analytics aggregation
- 🏷️ Automatic category detection
- 🎯 Priority and issue type classification
- 📈 Trend analysis over time

### Frontend (React + Vite)
- 🎨 Modern glassmorphism UI design
- 📊 Interactive Chart.js visualizations
- 🔍 Advanced filtering and search
- ⭐ Star rating system
- 🏷️ Status management (New, In Progress, Resolved, Closed)
- 📱 Fully responsive design

### Key Differentiators from E-commerce Feedback
- **Service-focused categories**: Performance, Support, Features, Usability, Reliability
- **Issue tracking**: Track feedback status and priority
- **Actionable insights**: Keyword extraction for feature requests and pain points
- **Trend analysis**: Track sentiment and issues over time

## 📦 Tech Stack

- **Frontend**: React, Vite, Chart.js, React Router, Axios
- **Backend**: Node.js, Express, CORS
- **NLP**: Custom keyword-based sentiment analysis
- **Data Storage**: JSON file (upgradable to Firebase/MySQL)
- **Charts**: Chart.js with react-chartjs-2

## 🛠️ Installation

### Quick Start (Recommended)

```bash
# Start the entire project with one command
./start-project.sh

# Stop the project
./stop-project.sh
```

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend will run on `http://localhost:5001`

#### Frontend Setup

```bash
cd Fback
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📖 API Endpoints

### Feedback Endpoints
- `POST /api/feedback` - Submit new feedback with automatic NLP analysis
- `GET /api/feedback` - Get all feedback (supports filters: category, sentiment, status, priority, search)
- `GET /api/feedback/:id` - Get specific feedback by ID
- `PUT /api/feedback/:id` - Update feedback status/priority
- `DELETE /api/feedback/:id` - Delete feedback

### Analytics Endpoints
- `GET /api/analytics` - Get aggregated analytics data
- `GET /api/analytics/trends?days=30` - Get sentiment trends over time

### Health Check
- `GET /health` - Server health check

## 🎯 Usage

### Quick Start
```bash
cd /Volumes/Mydrive/FeedPortal
npm start
```

### Manual Start
1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Development Server**
   ```bash
   cd Fback
   npm run dev
   ```

3. **Access the Application**
   - Open browser to `http://localhost:5173`
   - You'll be redirected to the login page

### 🔐 Authentication System

#### **User Login**
- **Email**: `user@feedportal.com`
- **Password**: `FeedPortal2026!`
- **Access**: Submit Feedback page only

#### **Admin Login**
- **Email**: `admin@feedportal.com`
- **Password**: `AdminPortal2026!`
- **Access**: Dashboard and All Feedback pages

#### **Role-Based Access Control**
- **👤 User**: Can only submit feedback
- **👨‍💼 Admin**: Can view dashboard and manage all feedback
- **🚫 Unauthorized**: Redirected to login with access denied messages

### 📱 Navigation After Login
- **Admin Users**:
  - **Dashboard**: View analytics and insights
  - **All Feedback**: View and manage all feedback
- **Regular Users**:
  - **Submit Feedback**: Submit new feedback

## 🔍 NLP Analysis Features

The system automatically analyzes each feedback submission:

- **Sentiment Detection**: Positive, Neutral, or Negative
- **Category Detection**: Auto-categorizes based on keywords
- **Keyword Extraction**: Identifies top keywords and themes
- **Priority Suggestion**: Critical, High, Medium, or Low
- **Issue Classification**: Bug, Feature Request, Complaint, or Praise

## 📊 Analytics Dashboard

- **Key Metrics**: Total feedback, average rating, sentiment percentage
- **Sentiment Distribution**: Doughnut chart
- **Category Breakdown**: Bar chart
- **Sentiment Trends**: Line chart over time
- **Keyword Cloud**: Visual representation of frequent keywords
- **Status Overview**: Progress bars for feedback status
- **Priority Breakdown**: Distribution of priority levels

## 🎨 Design Features

- Modern dark theme with purple/blue gradients
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Responsive design for all screen sizes
- Interactive hover effects
- Animated background

## 🔄 Future Enhancements

- Real-time updates with WebSockets
- Email notifications for critical feedback
- Advanced NLP with machine learning
- Database integration (Firebase/MySQL)
- User authentication and roles
- Export reports to PDF/CSV
- Multi-language support

## 📝 License

MIT License

## 👨‍💻 Author

Created for Hackathon - Customer Feedback Portal Challenge
