# 🔐 Auth System

A modern, full-stack authentication and license management system with an AI-powered chatbot assistant. Built with FastAPI and React.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.118.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🔑 Authentication & User Management
- **Secure Authentication**: JWT-based authentication with OAuth2 password bearer
- **User Registration & Login**: Username/password authentication with bcrypt hashing
- **Password Management**: Change password, password reset functionality
- **Account Management**: Update username, view account history, delete account
- **Secret Token System**: Secure token-based password recovery
- **Rate Limiting**: Protection against brute force attacks using SlowAPI

### 📜 License Management
- **Generate Licenses**: Create product licenses with customizable usage
- **License Validation**: Verify license keys and check remaining usage
- **License Handling**: View or export all your licenses
- **Delete Licenses**: Remove unused or expired licenses
- **Free Tier Limits**: 3 free licenses per user, unlimited for premium users

### 👑 Premium Features
- **Custom Licenses**: No "auth.cc" prefix at the beggining
- **Unlimited Licenses**: No limit on license generation for premium users
- **Premium Badge**: Visual distinction for premium accounts

### 🤖 AI Chat Assistant
- **OpenAI Integration**: Built-in AI chatbot powered by deepseek-v3
- **Context-Aware**: Get help with system features and troubleshooting
- **Real-time Responses**: Interactive chat interface

### 📊 Statistics & Analytics
- **User Count**: Track total registered users
- **Account History**: View all account activities and changes
- **Global Statistics**: System-wide metrics and insights

## 🏗️ Project Structure

```
auth-system/
├── backend/
│   └── app/
│       ├── app.py              # Main FastAPI application
│       ├── db.py               # Database utilities
│       ├── requirements.txt    # Python dependencies
│       └── data.db            # SQLite database
└── frontend/
    └── my-app/
        ├── src/
        │   ├── App.jsx                    # Main app component
        │   ├── LoginPage/                 # Authentication UI
        │   ├── MainPage/                  # Dashboard & main features
        │   │   ├── Views/                 # Feature components
        │   │   │   ├── GenerateLicense.jsx
        │   │   │   ├── CheckLicense.jsx
        │   │   │   ├── MyLicenses.jsx
        │   │   │   ├── DeleteLicense.jsx
        │   │   │   └── IntegrateSystem.jsx
        │   │   ├── ChatBot.jsx           # AI assistant
        │   │   └── Header.jsx            # Navigation
        │   └── SettingsComponents/        # Settings panels
        │       ├── AccountInformation.jsx
        │       ├── AccountHistory.jsx
        │       ├── PasswordReset.jsx
        │       ├── AccountDeletion.jsx
        │       ├── PremiumSection.jsx
        │       ├── GlobalStatistics.jsx
        │       ├── FAQ.jsx
        │       └── BecomeASponsor.jsx
        ├── package.json
        └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** for the backend
- **Node.js 18+** for the frontend
- **OpenAI API Key** (for chatbot functionality)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/app
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend/app` directory:
   ```env
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEEPSEEK_API_KEY=your-deepseek-api-key
   ```

5. Run the backend server:
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/change-password` - Update password
- `POST /auth/change-username` - Update username
- `DELETE /auth/delete-account` - Delete user account
- `GET /auth/check-username/{username}` - Check username availability
- `POST /auth/verify-secret-token` - Verify secret token
- `POST /auth/reset-password` - Reset password
- `GET /auth/get-secret-token` - Get user's secret token
- `POST /auth/reset-secret-token` - Generate new secret token
- `GET /me` - Get current user info

### License Management
- `POST /licenses/generate` - Create a new license
- `GET /licenses/list` - List user's licenses
- `GET /licenses/validate` - Validate a license key
- `DELETE /licenses/delete` - Delete a license

### User Management
- `GET /users` - List all users
- `GET /users/count` - Get total user count
- `GET /account/history` - Get account activity history

### Subscriptions
- `POST /subscribe` - Subscribe to premium

### AI Chat
- `POST /chat` - Send message to AI assistant

### Health
- `GET /` - Root endpoint
- `GET /health` - Health check

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLite** - Lightweight database
- **JWT** - Token-based authentication
- **Passlib & Bcrypt** - Password hashing
- **Python-JOSE** - JWT token handling
- **SlowAPI** - Rate limiting middleware
- **OpenAI API** - AI chatbot integration
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting
- **CSS3** - Styling

## 🔒 Security Features

- **Password Hashing**: Bcrypt algorithm with salt
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Secret Token System**: Secure password recovery mechanism
- **Token Expiration**: Automatic session timeout

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Modern Interface**: Clean, intuitive user experience
- **Dark Mode Support**: (if implemented)
- **Real-time Updates**: Dynamic content loading
- **Interactive Components**: Smooth transitions and animations

## 📝 Environment Variables

### Backend (.env)
```env
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEEPSEEK_API_KEY=your-deepseek-api-key
```


**❤️ Made by [sh4dv](https://github.com/sh4dv)**
