import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./components/FormContainer/LandingPage";
import LoginForm from "./components/FormContainer/LoginForm";
import SignupForm from "./components/FormContainer/SignupForm";
// import VerifyEmail from "./components/FormContainer/VerifyEmail";
// import ForgotPassword from "./components/FormContainer/ForgotPassword";
// import ResetPassword from "./components/FormContainer/ResetPassword";

import Home from "./components/HomeContainer/Home";

import ShowProfileWithParams from "./components/ProfileContainer/ShowProfile";
import EditProfile from "./components/ProfileContainer/EditProfile";
import ChangePassword from "./components/ProfileContainer/ChangePassword";

import Network from "./components/NetworkContainer/Network";
import Connections from "./components/NetworkContainer/Connections";
import Requests from "./components/NetworkContainer/Requests";

import Notifications from "./components/Notifications";

import Chat from "./components/ChatContainer/Chat";

import Premium from "./components/Premium";

import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import Cookies from "js-cookie";

const BASE_URL = "/api";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
        });
        console.log("Profile Sync Data:", res.data);
        dispatch({ type: "SET_USER", payload: res.data });
      } catch (err) {
        if (err.response?.status === 401) {
          // 🧹 Clean up frontend states if backend invalidates session
          Cookies.remove("jwt_token");
          dispatch({ type: "LOGOUT_USER" }); // Or whatever resets your Redux user node to null
          return;
        }
        console.error("Profile fetch error:", err);
      }
    };

    syncUser();
  }, [dispatch]);

  return (
    <Routes>

      {/* Public */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      {/* <Route path="/verify-email/:token" element={<VerifyEmail />} /> */}
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}

      {/* Protected */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/*  MAIN PROFILE (SELF + OTHER) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ShowProfileWithParams />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <ShowProfileWithParams />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* NETWORK */}
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
        path="/network"
        element={
          <ProtectedRoute>
            <Network />
          </ProtectedRoute>
        }
      />

      {/* CHAT */}
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

      {/* NOTIFICATIONS */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/premium"
        element={
          <ProtectedRoute>
            <Premium />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/not-found" />} />

    </Routes>
  );
};

export default App;