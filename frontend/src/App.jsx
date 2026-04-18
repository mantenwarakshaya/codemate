import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "./components/FormContainer/LoginForm";
import SignupForm from "./components/FormContainer/SignupForm";
import VerifyEmail from "./components/FormContainer/VerifyEmail";
import ForgotPassword from "./components/FormContainer/ForgotPassword";
import ResetPassword from "./components/FormContainer/ResetPassword";

import Home from "./components/HomeContainer/Home";
import Profile from "./components/Profile";
import Connections from "./components/NetworkContainer/Connections";
import Requests from "./components/NetworkContainer/Requests";
import Notifications from "./components/Notifications";
import Network from "./components/NetworkContainer/Network";
import ShowProfile from "./components/ShowProfile";
import Chat from "./components/ChatContainer/Chat";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await axios.get("/api/profile/view", {
          withCredentials: true,
        });

        dispatch({ type: "SET_USER", payload: res.data });
      } catch (err) {
        // ✅ Ignore 401 (user not logged in)
        if (err.response?.status === 401) {
          return;
        }

        // ❗ Log only real errors
        console.error("Profile fetch error:", err);
      }
    };

    syncUser();
  }, [dispatch]);
  return(
    <>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Dynamic profile view */}
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <ShowProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <Connections />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        }
      />

      <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />

      <Route
        path="/chat/:targetUserId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/network"
        element={
          <ProtectedRoute>
            <Network />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/not-found" />} />
    </Routes>
    </>
  )
};

export default App;