#!/bin/bash

# FeedPortal Project Startup Script
echo "🚀 Starting FeedPortal Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Kill any existing processes on ports 5001 and 5173
echo "🔄 Cleaning up existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start Backend Server
echo "🔧 Starting Backend Server..."
cd /Volumes/Mydrive/FeedPortal/backend
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend Server started successfully on http://localhost:5001"
else
    echo "❌ Backend Server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Frontend Development Server
echo "🎨 Starting Frontend Development Server..."
cd /Volumes/Mydrive/FeedPortal/Fback
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend started successfully on http://localhost:5173"
else
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 FeedPortal is now running!"
echo "📊 Backend API: http://localhost:5001"
echo "🖥️  Frontend: http://localhost:5173"
echo "📝 Submit Feedback: http://localhost:5173/submit"
echo ""
echo "To stop the project, run: ./stop-project.sh"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Save PIDs to file for stopping later
echo "$BACKEND_PID" > /tmp/feedportal_backend.pid
echo "$FRONTEND_PID" > /tmp/feedportal_frontend.pid
