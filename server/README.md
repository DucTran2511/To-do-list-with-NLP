# Todo Sharing Server

A simple Node.js/Express server for real-time task sharing between users across different browsers and devices.

## Features

- 🔄 Real-time task sharing between users
- 🌐 Cross-browser and cross-device support
- 📤 Share individual tasks with email addresses
- ✅ Accept or decline shared tasks
- 👥 User search functionality
- 💾 Persistent data storage using JSON files
- 🔍 Debug endpoints for development

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:3001`

### 3. Start the Frontend
In another terminal:
```bash
cd ..
npm run dev
```

The frontend will run on `http://localhost:5174`

## API Endpoints

### Task Sharing
- `POST /api/share-task` - Share a task with another user
- `GET /api/shared-tasks/:email` - Get shared tasks for a user
- `POST /api/accept-shared-task/:taskId` - Accept a shared task
- `DELETE /api/decline-shared-task/:taskId` - Decline a shared task

### User Management
- `POST /api/auth/register` - Register/login user
- `GET /api/users/search/:query` - Search users for sharing

### Debug Endpoints
- `GET /api/health` - Server health check
- `GET /api/debug/shared-tasks` - View all shared tasks
- `DELETE /api/debug/shared-tasks` - Clear all shared tasks

## How It Works

1. **Share a Task**: Click "Share" on any task, enter recipient's email
2. **Receive Tasks**: Shared tasks appear in "📤 Tasks Shared With You" section
3. **Accept/Decline**: Recipients can add tasks to their list or decline
4. **Cross-Device**: Works across different browsers, devices, and users

## Testing Multi-User Sharing

1. **User A (Sender)**:
   - Open http://localhost:5174 in Chrome
   - Login with `sender@example.com`
   - Create a task and share it with `receiver@example.com`

2. **User B (Receiver)**:
   - Open http://localhost:5174 in Firefox (or different browser)
   - Login with `receiver@example.com`
   - See the shared task in the "📤 Tasks Shared With You" section
   - Click "Add to My List" to accept

## Data Storage

- **Development**: Uses JSON files (`shared_tasks.json`, `users.json`)
- **Production**: Can be easily adapted to use PostgreSQL, MongoDB, etc.

## Server Status

The frontend shows server status in the debug panel:
- 🟢 **OK**: Server is running and accessible
- 🔴 **OFFLINE**: Server is down, falls back to localStorage
- 🟡 **checking...**: Checking server connection

## Fallback Behavior

If the server is unavailable, the app automatically falls back to localStorage-based sharing (same-browser only).

## Development

To add new features:
1. Add API endpoints in `server.js`
2. Update `SharingService` in frontend
3. Modify the UI components as needed

## Production Deployment

For production, consider:
- Using a real database (PostgreSQL, MongoDB)
- Adding authentication/authorization
- Implementing WebSocket for real-time updates
- Adding rate limiting and security measures
- Using environment variables for configuration
