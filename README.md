🚀 Codemate | Developer Networking & Collaboration

   . Codemate is a high-performance, full-stack networking platform built for the   modern developer. It enables users to discover peers, collaborate on technical projects, and engage in real-time communication within a secure, professional ecosystem.


🛠️ Technical Architecture

* Frontend

   . Library: React.js (Vite).
   . State Management:

      . Redux: Manages global user authentication, professional bio details, and persistent profile state.

      . Zustand: Powering high-frequency real-time chat state and socket events.

   . Styling: Responsive, segmented UI using custom CSS with dedicated mobile-first media queries.

* Backend

   . Server: Node.js & Express.js.

   . Database: MongoDB with Mongoose ODM.

   . Real-time: Socket.io for instant messaging, "seen" status, and online presence tracking.

   . Payments: Secure Razorpay API integration for premium subscription handling.


✨ Key Features

   📡 Real-Time Interaction

      .Instant Chat: Direct messaging with real-time "seen" indicators and online status.

      .Notification Center: A unified feed aggregating connection requests, unread messages, and profile views.


   🤝 Professional Networking

      . Developer Feed: Discover peers based on a specific tech stack including React, Node.js, and Python.

      . Request Management: Streamlined "Accept/Reject" flow for connection requests with optimistic UI updates.

      . Profile Insights: Premium users can unlock visibility into who has visited their profile.

   💎 Premium Ecosystem (Pro)

      . Monetization: Secure payment processing via Razorpay for monthly and yearly plans.

      . Identity: Exclusive "Premium Verified Badge" and increased daily action limits for Pro members.

   🔐 Security & Operations

      . JWT Auth: Secure, cookie-based authentication with high-order ProtectedRoute logic.

      . Account Safety: Secure password updates and a "Danger Zone" for account deletion requiring identity verification.


📂 Project Structure

   * Backend (/backend)
      . /src/config: Core configuration including database.js

      . /src/middlewares: Security guards such as auth.js

      . /src/models: Data schemas for user.js, message.js, payment.js, profileView.js, and connectionRequest.js

      . /src/routes: API endpoints for auth, chat, payment, profile, request, and user

      . /src/utils: Helper logic including socket.js, razorpay.js, sendEmail.js, validation.js, cleanup.js, and constants.js


   * Frontend (/frontend)

      . /src/components: Modular UI architecture:

      . ChatContainer: Real-time Chat and ConnectionsChatList

      . Common: Reusable views like EmptyView, ErrorView, LoaderView, and PremiumVerifiedBadge

      . FormContainer: Auth flows including Login, Signup, ForgotPassword, ResetPassword, VerifyEmail, and LandingPage

      . HomeContainer: Core landing logic with Feed, LeftSideBar, and RightSideBar

      . NetworkContainer: Networking hubs for Connections, Network (discovery), and Requests

      . ProfileContainer: User management via ShowProfile, EditProfile, and ChangePassword

      . /src/store: Dual-store logic with useChatStore.js (Zustand) and global store.js (Redux)

      . /src/utils: Frontend socket.js and API integration helpers


🚀 Environment Setup

   . The following environment variables are required for full functionality across development and production environments:

      . Keys 

         . BASE_URL          
         . MONGO_URI
         . JWT_SECRET
         . RAZORPAY_KEY_ID
         . RAZORPAY_KEY_SECRET
         . CLOUDINARY_API_KEY
         . CLOUDINARY_API_SECRET
         . CLOUDINARY_CLOUD_NAME
         . RESEND_API_KEY
         . EMAIL_USER
         . EMAIL_PASS
         . NODE_ENV
         . PORT