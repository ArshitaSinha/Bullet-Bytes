# Habit Tracker Application

A full-stack habit tracking application with MongoDB backend integration.

## Features

- Create, read, update, and delete habits
- Track daily habit completion
- Streak counting and persistence
- Calendar integration
- Real-time synchronization with backend
- Offline support with local storage fallback

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB service

3. Start the backend server:
```bash
npm run dev
```

4. Open the application in your browser:
```
http://localhost:3000
```

## Project Structure

```
├── config/
│   └── database.js     # Database configuration
├── models/
│   └── Habit.js        # Habit model schema
├── server.js           # Express server setup
├── habits.js           # Frontend habit management
├── habits.html         # Habit tracker UI
├── styles.css          # Application styles
└── package.json        # Project dependencies
```

## API Endpoints

- GET /api/habits/:userId - Get all habits for a user
- POST /api/habits - Create a new habit
- PUT /api/habits/:id - Update a habit
- DELETE /api/habits/:id - Delete a habit

## Development

Run the development server with hot reload:
```bash
npm run dev
```