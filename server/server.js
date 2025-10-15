const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (in production, use a real database)
let sharedTasks = [];
let users = [];

// Data persistence using JSON files
const SHARED_TASKS_FILE = path.join(__dirname, 'shared_tasks.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Load data from files
function loadData() {
  try {
    if (fs.existsSync(SHARED_TASKS_FILE)) {
      sharedTasks = JSON.parse(fs.readFileSync(SHARED_TASKS_FILE, 'utf8'));
    }
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data to files
function saveData() {
  try {
    fs.writeFileSync(SHARED_TASKS_FILE, JSON.stringify(sharedTasks, null, 2));
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load initial data
loadData();

// Routes

// Get shared tasks for a specific user
app.get('/api/shared-tasks/:email', (req, res) => {
  const { email } = req.params;
  const userSharedTasks = sharedTasks.filter(task => task.sharedTo === email);
  res.json(userSharedTasks);
});

// Share a task
app.post('/api/share-task', (req, res) => {
  const { task, sharedTo, sharedFrom } = req.body;
  
  if (!task || !sharedTo || !sharedFrom) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sharedTask = {
    ...task,
    id: `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sharedFrom,
    sharedTo,
    isShared: true,
    originalTaskId: task.id,
    sharedAt: new Date().toISOString()
  };

  sharedTasks.push(sharedTask);
  saveData();
  
  res.json({ 
    success: true, 
    sharedTask,
    message: `Task shared successfully with ${sharedTo}` 
  });
});

// Accept a shared task (add to user's personal tasks)
app.post('/api/accept-shared-task/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { userEmail } = req.body;
  
  const taskIndex = sharedTasks.findIndex(task => task.id === taskId && task.sharedTo === userEmail);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Shared task not found' });
  }

  const sharedTask = sharedTasks[taskIndex];
  
  // Remove from shared tasks
  sharedTasks.splice(taskIndex, 1);
  saveData();
  
  // Return the task data for the client to add to their local storage
  const personalTask = {
    ...sharedTask,
    id: `personal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isShared: false,
    sharedFrom: undefined,
    sharedTo: undefined,
    originalTaskId: undefined,
    sharedAt: undefined,
    createdBy: userEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json({ 
    success: true, 
    personalTask,
    message: 'Task added to your personal list' 
  });
});

// Decline a shared task
app.delete('/api/decline-shared-task/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { userEmail } = req.body;
  
  const taskIndex = sharedTasks.findIndex(task => task.id === taskId && task.sharedTo === userEmail);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Shared task not found' });
  }

  sharedTasks.splice(taskIndex, 1);
  saveData();
  
  res.json({ 
    success: true, 
    message: 'Shared task declined' 
  });
});

// Register/Login user (simple implementation)
app.post('/api/auth/register', (req, res) => {
  const { email, username, displayName } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.json({ success: true, user: existingUser });
  }
  
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    username,
    displayName,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveData();
  
  res.json({ success: true, user: newUser });
});

// Search users for sharing
app.get('/api/users/search/:query', (req, res) => {
  const { query } = req.params;
  const searchResults = users.filter(user => 
    user.email.toLowerCase().includes(query.toLowerCase()) ||
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.displayName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10); // Limit to 10 results
  
  res.json(searchResults);
});

// Get all shared tasks (for debugging)
app.get('/api/debug/shared-tasks', (req, res) => {
  res.json(sharedTasks);
});

// Clear all shared tasks (for debugging)
app.delete('/api/debug/shared-tasks', (req, res) => {
  sharedTasks = [];
  saveData();
  res.json({ success: true, message: 'All shared tasks cleared' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    sharedTasks: sharedTasks.length,
    users: users.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Todo Sharing Server running on port ${PORT}`);
  console.log(`📤 Shared tasks: ${sharedTasks.length}`);
  console.log(`👥 Users: ${users.length}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, saving data...');
  saveData();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, saving data...');
  saveData();
  process.exit(0);
});
