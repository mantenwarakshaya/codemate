import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import ShowProfile from "./components/ShowProfile";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<LoginForm />} />
    <Route path="/signup" element={<SignupForm />} />

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

    {/* Fallback */}
    <Route path="/not-found" element={<NotFound />} />
    <Route path="*" element={<Navigate to="/not-found" />} />
  </Routes>
);

export default App;