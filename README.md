# 🚀 Codemate - Developer Networking & Collaboration Platform

Codemate is a high-performance, full-stack networking platform built for modern developers. It enables users to discover peers based on tech stack, collaborate on technical projects, and engage in real-time communication within a secure, professional ecosystem. Think of it as connecting passionate technologists worldwide.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture & Design](#architecture--design)
- [Database Models](#database-models)
- [Contributing](#contributing)

---

## 🎯 Overview

Codemate is a modern, scalable platform designed to:
- Connect developers based on shared tech stacks and interests
- Enable real-time messaging and collaboration
- Provide a professional networking experience with premium features
- Facilitate profile discovery and connection management
- Support secure payments for premium memberships

**Current Version:** 1.0.0  
**Author:** Mantenwar Akshaya  
**License:** ISC

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB (with Mongoose ODM 9.x)
- **Real-time Communication:** Socket.io 4.x
- **Authentication:** JWT (JSON Web Tokens) with Cookies
- **Payment Processing:** Razorpay API 2.x
- **Image Storage:** Cloudinary v2
- **Email Service:** Nodemailer & Resend
- **Task Scheduling:** node-cron 4.x
- **Security:** bcrypt 6.x, CORS, cookie-parser
- **Validation:** validator.js 13.x

### Frontend
- **Library:** React 19.x
- **Build Tool:** Vite 8.x
- **State Management:** 
  - Redux Toolkit 2.x (global auth & profile state)
  - Zustand 5.x (real-time chat state)
- **HTTP Client:** Axios 1.x
- **Real-time Client:** Socket.io-client 4.x
- **Routing:** React Router DOM 7.x
- **UI Components:** React Icons, Lucide React
- **Styling:** Custom CSS with responsive design
- **Utilities:** date-fns, js-cookie, react-loader-spinner

---

## ✨ Key Features

### 📡 Real-Time Interaction
- **Instant Chat:** Direct messaging between connected developers with real-time message delivery
- **Seen Indicators:** Track message read status in real-time
- **Online Status:** Live presence tracking shows who's currently active
- **Notification Center:** Unified feed aggregating connection requests, unread messages, and profile views

### 🤝 Professional Networking
- **Developer Feed:** Discover peers based on tech stacks (React, Node.js, Python, etc.)
- **Smart Matching:** Connect with developers who share similar interests and experience levels
- **Request Management:** Streamlined "Accept/Reject" flow for connection requests with optimistic UI updates
- **Connection Status:** Track pending, accepted, and rejected connections
- **Profile Insights:** View developer profiles with tech stack, experience, and links (GitHub, LinkedIn, Twitter)

### 💎 Premium Ecosystem (Pro)
- **Premium Verification:** Exclusive "Premium Verified Badge" on profiles
- **Profile Visitors:** Unlock visibility into who has viewed your profile (premium feature)
- **Increased Limits:** Higher daily action limits for premium members
- **Monthly & Yearly Plans:** Flexible subscription options
- **Secure Payments:** PCI-compliant payment processing via Razorpay

### 🔐 Security & Operations
- **JWT Authentication:** Secure, cookie-based authentication with HTTP-only cookies
- **Protected Routes:** High-order component logic for route-level authorization
- **Password Security:** Strong password validation (min 8 chars, uppercase, lowercase, number, symbol)
- **Account Safety:** Secure password updates and account deletion with verification
- **Email Verification:** Verify user emails during signup
- **Automatic Cleanup:** Background tasks for database maintenance

---

## 📂 Project Structure

```
codemate/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── app.js                   # Main Express app setup
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection config
│   │   ├── middlewares/
│   │   │   └── auth.js              # JWT verification middleware
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── user.js              # User profile schema
│   │   │   ├── connectionRequest.js  # Connection request schema
│   │   │   ├── message.js           # Message schema
│   │   │   ├── payment.js           # Payment/subscription schema
│   │   │   └── profileView.js       # Profile visit tracking
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.js              # Auth endpoints (login, signup, logout)
│   │   │   ├── user.js              # User endpoints
│   │   │   ├── profile.js           # Profile endpoints
│   │   │   ├── request.js           # Connection request endpoints
│   │   │   ├── chat.js              # Messaging endpoints
│   │   │   └── payment.js           # Payment endpoints
│   │   └── utils/
│   │       ├── socket.js            # Socket.io setup & event handlers
│   │       ├── razorpay.js          # Razorpay integration
│   │       ├── sendEmail.js         # Email sending utility
│   │       ├── validation.js        # Input validation helpers
│   │       ├── cleanup.js           # Background cleanup tasks
│   │       ├── constants.js         # App-wide constants
│   └── package.json
│
├── frontend/                         # React/Vite frontend
│   ├── src/
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   ├── store.js                 # Redux store setup
│   │   ├── index.css                # Global styles
│   │   ├── App.css                  # App component styles
│   │   ├── components/
│   │   │   ├── ChatContainer/       # Real-time chat UI
│   │   │   │   ├── Chat/            # Message display & input
│   │   │   │   └── ConnectionsChatList/  # Chat conversation list
│   │   │   ├── Common/              # Reusable components
│   │   │   │   ├── EmptyView/       # Empty state display
│   │   │   │   ├── ErrorView/       # Error state display
│   │   │   │   ├── LoaderView/      # Loading spinner
│   │   │   │   └── PremiumVerifiedBadge/  # Premium badge
│   │   │   ├── FormContainer/       # Authentication flows
│   │   │   │   ├── LandingPage/     # Landing/home page
│   │   │   │   ├── LoginForm/       # Login page
│   │   │   │   ├── SignupForm/      # Signup page
│   │   │   │   ├── ForgotPassword/  # Password recovery
│   │   │   │   ├── ResetPassword/   # Password reset
│   │   │   │   └── VerifyEmail/     # Email verification
│   │   │   ├── Header/              # Navigation header
│   │   │   ├── HomeContainer/       # Main feed area
│   │   │   │   ├── Home/            # Feed layout
│   │   │   │   ├── Feed/            # Developer feed display
│   │   │   │   ├── LeftSidebar/     # Navigation sidebar
│   │   │   │   └── RightSidebar/    # User suggestions/info
│   │   │   ├── NetworkContainer/    # Networking features
│   │   │   │   ├── Network/         # Discovery feed
│   │   │   │   ├── Connections/     # Connected users list
│   │   │   │   └── Requests/        # Pending requests
│   │   │   ├── NotFound/            # 404 page
│   │   │   ├── Notifications/       # Notification center
│   │   │   ├── Premium/             # Premium features/upgrade
│   │   │   ├── ProfileContainer/    # User profile management
│   │   │   │   ├── ShowProfile/     # Profile view
│   │   │   │   ├── EditProfile/     # Profile editor
│   │   │   │   └── ChangePassword/  # Password change form
│   │   │   └── ProtectedRoute/      # Route authorization wrapper
│   │   ├── store/
│   │   │   └── useChatStore.js      # Zustand chat state store
│   │   └── utils/
│   │       ├── socket.js            # Socket.io client setup
│   │       └── [API helpers]        # Axios API utilities
│   ├── public/                       # Static assets
│   ├── vite.config.js              # Vite build config
│   ├── eslint.config.js            # ESLint config
│   ├── index.html                  # HTML template
│   └── package.json
│
├── package.json                     # Root project config
└── README.md                        # This file
```

---

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** v18.x or higher
- **npm** v9.x or higher
- **MongoDB** (local instance or MongoDB Atlas connection string)
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mantenwarakshaya/codemate.git
cd codemate
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 5. Create Environment Files

**Backend `.env` file** (`backend/.env`):
```env
# Server Configuration
NODE_ENV=development
PORT=7777

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codemate

# JWT Secret (use a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Razorpay (Payment Processing)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Services
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RESEND_API_KEY=your_resend_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Frontend Configuration:**
- Frontend uses environment variables from `.env` (if needed)
- BASE_URL is configured in `App.jsx` to use `http://localhost:7777/api` in development

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# or
npm start
```
Backend will run on `http://localhost:7777`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

```bash
# From root directory
npm run build

# This will build both frontend and install all dependencies
```

### Production Run
```bash
npm start
# Backend serves both API and frontend static files
```

---

## 📡 API Documentation

### Authentication Routes (`/api/auth/*`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### User Routes (`/api/user/*`)
- `GET /api/user/feed` - Get developer feed with filters
- `GET /api/user/:userId` - Get user profile details
- `PUT /api/user/update` - Update user information

### Profile Routes (`/api/profile/*`)
- `GET /api/profile/view` - Get current user's profile
- `PUT /api/profile/edit` - Edit profile information
- `POST /api/profile/change-password` - Change password
- `GET /api/profile/premium-badge` - Check premium status

### Connection Request Routes (`/api/request/*`)
- `POST /api/request/send/:toUserId` - Send connection request
- `GET /api/request/pending` - Get pending requests
- `GET /api/request/accepted` - Get accepted connections
- `PUT /api/request/accept/:requestId` - Accept request
- `PUT /api/request/reject/:requestId` - Reject request
- `DELETE /api/request/cancel/:requestId` - Cancel sent request

### Chat Routes (`/api/chat/*`)
- `GET /api/chat/messages/:userId` - Get messages with specific user
- `POST /api/chat/send` - Send message (for fallback)
- `PUT /api/chat/seen/:senderId` - Mark messages as seen

### Payment Routes (`/api/payment/*`)
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/status` - Check subscription status

---

## 🏗️ Architecture & Design

### Backend Architecture
```
┌─────────────────┐
│    Clients      │
│  (Browser/App)  │
└────────┬────────┘
         │
┌────────▼──────────────────────────┐
│        Express Server              │
├────────────────────────────────────┤
│  • CORS Middleware                 │
│  • Cookie Parser                   │
│  • JSON Body Parser (50MB limit)   │
│  • JWT Auth Middleware             │
└────────┬──────────────────────────┘
         │
    ┌────┴──────────────────────────────┐
    │                                   │
┌───▼─────┐  ┌──────────┐  ┌────────┐
│ Routes  │  │ Socket   │  │ Utils  │
├─────────┤  ├──────────┤  ├────────┤
│ • Auth  │  │ • Chat   │  │ • JWT  │
│ • User  │  │ • Status │  │ • Email│
│ • Chat  │  │ • Events │  │ • Pay  │
│ • Pay   │  │ • Rooms  │  │ • Val  │
└───┬─────┘  └──────────┘  └────────┘
    │
    └──────────┬─────────────────┐
               │                 │
        ┌──────▼──────┐  ┌──────▼────┐
        │  MongoDB    │  │ Cloudinary │
        │  (Data)     │  │ (Images)   │
        └─────────────┘  └────────────┘
```

### Frontend Architecture
```
┌──────────────────────────────────┐
│         React App (Vite)         │
├──────────────────────────────────┤
│  ProtectedRoute HOC              │
│  (Authorization wrapper)         │
└──────────┬───────────────────────┘
           │
    ┌──────┴────────────────────────────┐
    │                                   │
┌───▼──────────────────┐  ┌────────────▼────┐
│   Redux Store        │  │ Zustand Store    │
├──────────────────────┤  ├──────────────────┤
│ • User Auth          │  │ • Chat Messages  │
│ • Profile Data       │  │ • Socket Events  │
│ • Global State       │  │ • Real-time Data │
└──────────────────────┘  └──────────────────┘
           │
    ┌──────┴────────────────┐
    │                       │
┌───▼──────────────┐  ┌─────▼──────────────┐
│   Components     │  │  Utilities         │
├──────────────────┤  ├────────────────────┤
│ • ChatContainer  │  │ • Socket Client    │
│ • HomeContainer  │  │ • Axios (HTTP)     │
│ • ProfileCont.   │  │ • Validation       │
│ • NetworkCont.   │  │ • Helpers          │
└──────────────────┘  └────────────────────┘
           │
    ┌──────┴───────────────────┐
    │                          │
┌───▼──────────┐  ┌──────────▼────┐
│  Backend API │  │  Socket.io     │
│  (REST)      │  │  (Real-time)   │
└──────────────┘  └────────────────┘
```

### Real-Time Communication Flow
1. **Socket Connection:** Frontend connects to Socket.io server on app load
2. **Event Listeners:**
   - `newMessage` - Receives new messages
   - `messageSeen` - Receives seen notifications
   - `userOnline` / `userOffline` - Tracks presence
   - `connectionRequest` - New connection requests
3. **Event Emitters:**
   - `sendMessage` - Send messages with metadata
   - `markSeen` - Mark message as read
   - `typing` - Typing indicator (optional)

---

## 💾 Database Models

### User Schema
```javascript
{
  firstName: String (required, 4-50 chars),
  lastName: String,
  emailId: String (required, unique, valid email),
  password: String (required, strong validation),
  age: Number (min: 18),
  gender: Enum ["male", "female", "other"],
  experience: Number (min: 0),
  github: String (optional GitHub profile),
  linkedIn: String (optional LinkedIn profile),
  twitter: String (optional Twitter handle),
  bio: String (optional professional bio),
  skills: [String] (tech stack),
  profileImage: String (Cloudinary URL),
  isPremium: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Connection Request Schema
```javascript
{
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  status: Enum ["ignored", "interested", "accepted", "rejected"],
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  text: String (required),
  image: String (optional, Cloudinary URL),
  seen: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema
```javascript
{
  userId: ObjectId (ref: User),
  paymentId: String (Razorpay payment ID),
  orderId: String (Razorpay order ID),
  status: String (pending, completed, failed),
  amount: Number,
  currency: String,
  receipt: String,
  notes: {
    firstName: String,
    lastName: String,
    membershipType: String (monthly/yearly)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Profile View Schema
```javascript
{
  viewedBy: ObjectId (ref: User),
  viewedUser: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Configuration

### CORS Configuration
- **Development:** Allows `http://localhost:5173`
- **Production:** Allows `FRONTEND_URL` environment variable

### Trust Proxy
- Backend trusts proxy at level 1 for accurate IP tracking

### Socket.io Namespaces
- `/` - Default namespace for chat and general events
- Rooms created per user for targeted messaging

---

## 🚨 Security Measures

1. **Authentication:** JWT tokens stored in HTTP-only cookies
2. **Password Hashing:** bcrypt with salt rounds (10+)
3. **Input Validation:** Comprehensive validation for all user inputs
4. **CORS:** Restricted to allowed origins only
5. **Rate Limiting:** Implement in production (recommended)
6. **SQL Injection:** Protected via Mongoose ODM
7. **XSS Prevention:** React's built-in escaping + CSP headers (recommended)

---

## 📦 Dependencies Overview

### Critical Backend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.2.1 | Web framework |
| mongoose | 9.3.3 | MongoDB ODM |
| socket.io | 4.8.3 | Real-time communication |
| jsonwebtoken | 9.0.3 | Authentication tokens |
| bcrypt | 6.0.0 | Password hashing |
| razorpay | 2.9.6 | Payment processing |
| cloudinary | 2.9.0 | Image storage |
| nodemailer | 8.0.5 | Email sending |
| dotenv | 17.4.1 | Environment variables |

### Critical Frontend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.4 | UI library |
| vite | 8.0.8 | Build tool |
| redux / @reduxjs/toolkit | 2.11.2 | State management |
| zustand | 5.0.13 | Chat state |
| react-router-dom | 7.14.0 | Routing |
| socket.io-client | 4.8.3 | Real-time client |
| axios | 1.15.0 | HTTP client |

---

## 🧪 Testing & Quality

### ESLint Configuration
- React plugin enabled
- React Compiler babel plugin for optimization
- ESLint and ESLint Plugin React included

### Code Quality
- Follows React hooks best practices
- Zustand for complex real-time state
- Redux Toolkit for normalized state

---

## 📝 Git Workflow

```bash
# Create a feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description"

# Push to remote
git push origin feature/feature-name

# Create Pull Request on GitHub
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB Atlas cluster is running
- Check `MONGO_URI` in `.env` file
- Verify IP whitelist in MongoDB Atlas

### CORS Errors
- Check `FRONTEND_URL` in backend `.env`
- Verify frontend is running on correct port
- Check backend CORS middleware configuration

### Socket.io Connection Failed
- Ensure backend is running
- Check Socket.io CORS configuration
- Verify frontend Socket.io client setup

### Razorpay Payment Issues
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Check if payment gateway is in test mode
- Ensure order creation returns valid order ID

---

## 📞 Support & Contact

For issues, questions, or feature requests:
- **GitHub Issues:** [GitHub Repository](https://github.com/mantenwarakshaya/codemate/issues)
- **Author Email:** Open an issue on GitHub

---

## 📄 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with modern web technologies (React, Node.js, Socket.io)
- Community-driven development
- Special thanks to all contributors

---

**Happy Coding! 🎉**