#!/bin/bash

# FeedPortal Project Stop Script
echo "🛑 Stopping FeedPortal Project..."

# Kill processes using PIDs if available
if [ -f /tmp/feedportal_backend.pid ]; then
    BACKEND_PID=$(cat /tmp/feedportal_backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend Server stopped (PID: $BACKEND_PID)"
    fi
    rm -f /tmp/feedportal_backend.pid
fi

if [ -f /tmp/feedportal_frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/feedportal_frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend Server stopped (PID: $FRONTEND_PID)"
    fi
    rm -f /tmp/feedportal_frontend.pid
fi

# Also kill any processes on the ports
echo "🔄 Cleaning up any remaining processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "✅ FeedPortal stopped completely!"
