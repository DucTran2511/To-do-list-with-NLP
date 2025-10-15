[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)

# 📝 NLP-Powered To-Do List Application

A modern, intelligent task management application built for the NAVER Vietnam AI Hackathon. This application features natural language processing (NLP) for intuitive task creation, real-time collaboration, and smart reminders to help students manage their time effectively.

![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.2-purple)

---

## 🚀 Project Setup & Usage

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Modern web browser with notification support

### Installation & Running

**1. Install frontend dependencies:**
```bash
npm install
```

**2. Run the frontend development server:**
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

**3. (Optional) Install and run backend server for task sharing:**
```bash
cd server
npm install
npm start
```
The server will run at `http://localhost:3001`

**4. Build for production:**
```bash
npm run build
npm run preview
```

## 🔗 Deployed Web URL or APK file

🌐 **Live Demo:** https://github.com/DucTran2511/To-do-list-with-NLP.git

📱 The application is a responsive web app that works on all devices (mobile, tablet, desktop)

## 🎥 Demo Video

**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.

📺 [Demo Video Link - To be added]

---

## 💻 Project Introduction

### a. Overview

**NLP-Powered To-Do List** is an intelligent task management solution specifically designed for Vietnamese university students who struggle with time management. The application addresses the daily crisis of juggling multiple tasks across classes, group projects, part-time work, and personal life.

**The Problem:** Students manage dozens of tasks manually, leading to missed deadlines, forgotten assignments, and stress.

**The Solution:** An intuitive to-do list app that:
- Understands natural language input (no complex forms to fill)
- Provides smart reminders based on due dates and times
- Enables task sharing for group projects
- Offers multiple views to visualize workload
- Works offline with local storage

**Target Users:** Vietnamese university students, but useful for anyone needing better task management.

### b. Key Features & Function Manual

#### 🧠 **Natural Language Processing (NLP)**
Create tasks naturally without filling forms:

**Examples:**
```
Submit assignment :dtomorrow :t11:59pm :phigh #school
Team meeting :dmonday :t2pm #work
Buy groceries :dtoday #personal
Fix bug !!! :dasap @project
```

**Supported Tags:**
- **Date Tags**: `:dtoday`, `:dtomorrow`, `:dmonday`, `:d2025-12-25`, `:d12/25`
- **Time Tags**: `:t14:30`, `:t2pm`, `:t9:30am`
- **Priority Tags**: `:plow`, `:pmedium`, `:phigh` (or `:p1`, `:p2`, `:p3`)
- **Hashtags**: `#work`, `#urgent`, `#personal` (up to 5 tags per task)
- **Project Tags**: `@work`, `@school`, `@personal`

**Keywords:**
- **Dates**: today, tomorrow, yesterday, monday-sunday, "next week", "next month"
- **Priority**: urgent, important, asap, `!!!`, `!!`, `!`

#### 👥 **User Authentication**
- Secure signup and login system
- User profiles with customizable settings
- Session management with persistent login
- Each user has their own task list

#### 🤝 **Task Sharing & Collaboration**
Perfect for group projects:
- Share tasks with other users via email
- Recipient gets notification of shared tasks
- Accept or decline shared tasks
- Add accepted tasks to personal list
- Server-based sharing with offline fallback

#### 📅 **Multiple Views**
1. **List View**: Traditional task list with sorting and filtering
2. **Calendar View**: Monthly calendar showing tasks on specific dates
3. **Chronological View**: Tasks grouped by due date with date headers
4. **Today View**: Focus on today's tasks
5. **Overdue View**: See all overdue tasks

#### 🔔 **Smart Reminder System**
- Browser notifications for tasks due within 24 hours
- Automatic scheduling when due date/time is set
- Click notification to jump to task
- Permission management for browser notifications

#### 🎯 **Advanced Filtering**
- **By Status**: All, Active, Completed, Today, Overdue, Trash
- **By Project**: Filter tasks by assigned project
- **By Tags**: Multiple tag selection with search
- **By Search**: Search task titles, tags, and notes
- **By Date Range**: Custom start and end dates
- **By Time Range**: Filter tasks by specific time periods

#### ⚙️ **Complete Task Management**
- ✅ **Create**: Add tasks with NLP or traditional input
- 📖 **Read**: View tasks in multiple formats
- ✏️ **Update**: Edit tasks inline with full NLP support
- 🗑️ **Delete**: Soft delete to trash (recoverable)
- ♻️ **Restore**: Recover deleted tasks from trash
- 💥 **Permanent Delete**: Remove tasks permanently from trash
- ⏪ **Undo**: Undo last 5 actions (delete, complete)

#### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + K`: Focus search bar
- `Ctrl/Cmd + N`: Focus new task input
- `Ctrl/Cmd + Z`: Undo last action
- `Esc`: Clear inputs or cancel editing

### c. Unique Features (What's special about this app?)

#### 🌟 **1. Intelligent Natural Language Parser**
Unlike traditional to-do apps that require multiple clicks and form fields, this app understands natural language:
```
"Submit final project :d12/25 :t11:59pm :phigh #school #urgent @university"
```
Instantly creates a task with:
- Title: "Submit final project"
- Due: December 25, 2025, 11:59 PM
- Priority: High
- Tags: school, urgent
- Project: university

#### 🚀 **2. Flexible Tag System**
- Multiple tag support (`:d`, `:t`, `:p` syntax) + hashtags
- Both work together for maximum flexibility
- Auto-parsing of keywords like "tomorrow", "urgent"
- Limit of 5 tags per task to avoid clutter

#### 📊 **3. Chronological Timeline View**
Tasks are grouped by date with beautiful date headers:
```
📅 Today (October 15)
  - Task 1 (2:00 PM)
  - Task 2 (4:30 PM)

📅 Tomorrow (October 16)
  - Task 3 (9:00 AM)
  - Task 4 (No time set)
```

#### 🎨 **4. Visual Priority & Status Indicators**
- Color-coded priorities (green=low, yellow=medium, red=high)
- Overdue tasks highlighted in red
- Completed tasks styled with strikethrough
- Visual feedback for all actions

#### 💾 **5. Offline-First Architecture**
- All data stored locally (works without internet)
- Optional server for advanced sharing features
- Instant performance with local storage
- Fallback mechanisms for all server features

#### 🔄 **6. Smart Undo System**
- Remembers last 5 destructive actions
- Can undo task completion or deletion
- Visual undo notifications with action buttons
- Automatic cleanup of old undo history

#### 🎯 **7. Context-Aware Filtering**
Advanced filtering system that combines multiple criteria:
- Filter by multiple tags simultaneously
- Combine date range + time range + status filters
- Real-time search across all task fields
- Clear all filters with one click

### d. Technology Stack and Implementation Methods

#### **Frontend Stack**
- **React 19.1.1**: Latest React with concurrent features for smooth UI
- **TypeScript 5.8.3**: Type safety and better developer experience
- **Vite 7.1.2**: Lightning-fast build tool and dev server
- **date-fns**: Modern date manipulation library
- **CSS3**: Custom styling with CSS variables and animations

#### **Backend Stack (Optional)**
- **Node.js**: JavaScript runtime
- **Express 4.18.2**: Minimal web framework
- **CORS**: Enable cross-origin requests
- **Body-parser**: JSON request parsing
- **File-based storage**: JSON files for data persistence

#### **Implementation Details**

**1. NLP Parser (`src/shared/utils/nlp-parser.ts`)**
- Regex-based pattern matching for tags
- Keyword dictionary for natural language dates
- Priority parsing with multiple formats
- Tag extraction and limiting
- Project hint detection

**2. Reminder System (`src/shared/utils/reminder-system.ts`)**
- Browser Notification API integration
- Timeout-based scheduling
- Permission management
- Notification interaction handling
- Automatic cleanup of past reminders

**3. Authentication (`src/features/authentication/`)**
- Local storage-based user management
- Session tokens
- Password validation
- User profile management

**4. Sharing System (`src/features/sharing/`)**
- RESTful API design
- Server-client synchronization
- Fallback to local storage
- User search and discovery

**5. State Management**
- React Hooks (useState, useEffect)
- Local storage synchronization
- Optimistic UI updates
- Efficient re-rendering with proper dependencies

### e. Service Architecture & Database Structure

#### **Architecture Diagram**
```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ MainLayout   │  │ Auth System  │  │ Sharing UI   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ NLP Parser   │  │ Reminder Mgr │  │ Storage Utils│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ↕ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────┐
│              Backend Server (Optional)                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Express Server                       │  │
│  │                                                   │  │
│  │  Routes:                                          │  │
│  │  - POST   /api/share-task                        │  │
│  │  - GET    /api/shared-tasks/:email               │  │
│  │  - POST   /api/accept-shared-task/:id            │  │
│  │  - DELETE /api/decline-shared-task/:id           │  │
│  │  - GET    /api/users/search/:query               │  │
│  │  - POST   /api/users/register                    │  │
│  └──────────────────────────────────────────────────┘  │
│                              │                           │
│                              ↕                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │         JSON File Storage                         │  │
│  │  - shared_tasks.json                             │  │
│  │  - users.json                                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ↕
┌─────────────────────────────────────────────────────────┐
│              Browser Local Storage                       │
│                                                          │
│  - todo-mvp:v1          (tasks)                         │
│  - todo-projects:v1     (projects)                      │
│  - todo-undo:v1         (undo history)                  │
│  - todo-users           (user accounts)                 │
│  - todo-session         (session token)                 │
│  - todo-current-user    (current user data)             │
│  - shared_tasks         (fallback shared tasks)         │
└─────────────────────────────────────────────────────────┘
```

#### **Data Models**

**Task Model:**
```typescript
{
  id: string                    // Unique identifier
  title: string                 // Task title
  notes?: string                // Optional notes
  completed: boolean            // Completion status
  priority: 'low'|'medium'|'high'
  dueDate?: string              // ISO date (YYYY-MM-DD)
  dueTime?: string              // 24-hour format (HH:mm)
  projectId?: string            // Associated project
  tags: string[]                // Array of tags (max 5)
  createdBy: string             // User ID
  sharedWith: string[]          // Array of user emails
  comments: Comment[]           // Task comments
  createdAt: string             // ISO timestamp
  updatedAt: string             // ISO timestamp
  deletedAt?: string            // Soft delete timestamp
}
```

**User Model:**
```typescript
{
  id: string                    // Unique identifier
  email: string                 // User email (unique)
  username: string              // Username (unique)
  displayName: string           // Display name
  preferences: {
    theme: 'auto'|'light'|'dark'
    notifications: boolean
    defaultView: 'list'|'calendar'
    timezone: string
  }
  createdAt: string             // ISO timestamp
  lastLoginAt: string           // ISO timestamp
}
```

**Project Model:**
```typescript
{
  id: string                    // Unique identifier
  name: string                  // Project name
  color: string                 // Hex color code
  createdAt: string             // ISO timestamp
}
```

**Shared Task Model (Server):**
```typescript
{
  ...Task                       // All task properties
  sharedFrom: string            // Sender email
  sharedTo: string              // Recipient email
  isShared: boolean             // Sharing flag
  originalTaskId: string        // Original task reference
  sharedAt: string              // Share timestamp
}
```

#### **Data Flow**

**1. Task Creation Flow:**
```
User Input → NLP Parser → Task Object → State Update → Local Storage → UI Update
```

**2. Task Sharing Flow:**
```
Share Button → Server API → shared_tasks.json → Recipient Notification
→ Recipient Accept → Server API → Personal Task List → UI Update
```

**3. Reminder Flow:**
```
Task with Due Date → Reminder Manager → Schedule Timeout
→ Due Time Reached → Browser Notification → User Click → Focus Task
```

---

## 🧠 Reflection

### a. If you had more time, what would you expand?

**1. Advanced AI Integration**
- Machine learning for task priority prediction based on user behavior
- Smart task estimation (how long tasks actually take)
- Procrastination pattern detection and nudging
- Automatic deadline suggestions based on workload

**2. Enhanced Collaboration**
- Real-time collaborative task editing (like Google Docs)
- Team workspaces with shared projects
- Task assignment and delegation
- Activity feed showing team progress
- Group chat for each shared task

**3. Mobile Experience**
- Native mobile apps (iOS/Android) using React Native
- Push notifications instead of browser notifications
- Offline sync when connection restored
- Mobile-optimized gestures (swipe to complete, etc.)

**4. Analytics & Insights**
- Productivity dashboard with charts
- Time tracking integration
- Completion rate trends
- Best productivity times of day
- Task estimation accuracy
- Procrastination heat map

**5. Integrations**
- Google Calendar sync
- Email notifications
- Slack/Discord integration
- GitHub issue sync for developers
- Canvas/Moodle LMS integration for students

**6. Advanced Features**
- Recurring tasks (daily, weekly, monthly)
- Subtasks and task dependencies
- File attachments and links
- Custom task templates
- Voice input for task creation
- Pomodoro timer integration

### b. If you integrate AI APIs more for your app, what would you do?

**1. OpenAI GPT Integration**
- **Advanced NLP**: Better natural language understanding for task parsing
  - "Remind me to submit that assignment next Tuesday evening"
  - Contextual understanding of vague references
- **Smart Suggestions**: AI suggests tags, priorities, and deadlines
- **Task Breakdown**: Automatically break large tasks into subtasks
  - Input: "Prepare for final exam"
  - Output: Subtasks for reviewing chapters, practice tests, study groups
- **Email Parsing**: Forward emails to create tasks automatically
- **Meeting Notes**: Convert meeting notes to action items

**2. Google Calendar API / Outlook Calendar API**
- **Calendar Integration**: Sync tasks with calendar events
- **Smart Scheduling**: Suggest best times to work on tasks
- **Conflict Detection**: Warn about overlapping commitments
- **Time Blocking**: Automatically schedule focus time for tasks

**3. Sentiment Analysis API**
- **Stress Detection**: Analyze task language to detect stress levels
- **Motivation Boost**: Suggest breaks or encouragement based on sentiment
- **Task Difficulty**: Estimate task complexity from description

**4. Speech-to-Text API (e.g., Web Speech API, Google Speech)**
- **Voice Input**: Create tasks by speaking
- **Hands-Free Mode**: Manage tasks while commuting or multitasking
- **Accessibility**: Better support for users with disabilities

**5. OCR API (Google Vision, Tesseract)**
- **Image Task Creation**: Take photo of whiteboard/notes to create tasks
- **Receipt Scanning**: Convert expenses to tasks with due dates
- **Handwriting Recognition**: Convert handwritten to-do lists to digital

**6. Recommendation Systems**
- **Task Prioritization AI**: Learn from user behavior to suggest priorities
- **Similar Task Suggestions**: "People who did X also did Y"
- **Optimal Work Time**: Suggest when to work on specific task types
- **Break Reminders**: AI-determined break times for productivity

**7. Notification Intelligence**
- **Smart Timing**: Learn best times to send reminders (not during class)
- **Adaptive Frequency**: Reduce notifications if user is responsive
- **Context Awareness**: Different notifications for work vs personal tasks

**8. Predictive Analytics**
- **Deadline Risk**: Predict which tasks are at risk of missing deadlines
- **Workload Balance**: Alert when taking on too many tasks
- **Pattern Recognition**: Identify recurring procrastination triggers

---

## ✅ Checklist

- [x] Code runs without errors
- [x] All required features implemented:
  - [x] Create tasks (with NLP support)
  - [x] Read/View tasks (multiple views)
  - [x] Update/Edit tasks (inline editing with NLP)
  - [x] Delete tasks (soft delete with recovery)
  - [x] Complete tasks (with undo functionality)
- [x] Full CRUD operations on tasks
- [x] Persistent storage (LocalStorage + optional server)
- [x] At least 3 different views (List, Calendar, Chronological, Filters)
- [x] Time/date handling (comprehensive NLP + reminders)
- [x] Supports 20+ items (tested with 50+ tasks)
- [x] Bonus features:
  - [x] User authentication
  - [x] Task sharing system
  - [x] Smart reminders
  - [x] Undo functionality
  - [x] Advanced filtering
  - [x] Keyboard shortcuts
  - [x] Responsive design
- [x] All ✍️ sections are filled

---

## 📄 License

This project is created for the NAVER Vietnam AI Hackathon.

## 👨‍💻 Author

**Duc Tran**
- GitHub: [@DucTran2511](https://github.com/DucTran2511)
- Repository: [To-do-list-with-NLP](https://github.com/DucTran2511/To-do-list-with-NLP)

## 🙏 Acknowledgments

- NAVER Vietnam AI Hackathon for the challenge and opportunity
- React and Vite teams for excellent development tools
- date-fns for powerful date utilities
- The open-source community for inspiration

---

**Built with ❤️ for Vietnamese university students struggling with time management**
