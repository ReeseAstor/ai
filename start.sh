#!/bin/bash

# AI Profit Automation System Startup Script

echo "================================================"
echo "   AI PROFIT AUTOMATION SYSTEM"
echo "================================================"
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | grep -Po '(?<=Python )\d+\.\d+')
echo "✓ Python version: $python_version"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "Checking dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file with your API keys before continuing!"
    echo "Press Enter when ready..."
    read
fi

# Create necessary directories
mkdir -p logs
mkdir -p data
mkdir -p backups

echo ""
echo "Starting AI Profit Automation System..."
echo "Dashboard will be available at: http://localhost:8501"
echo ""
echo "Press Ctrl+C to stop"
echo "================================================"
echo ""

# Start the main system
python main.py