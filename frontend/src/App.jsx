import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/protectedRoute";

import Dashboard from "./pages/Dashboard/Dashboard";
import DocumentListPage from "./pages/documents/DocumentListPage";
import DocumentDetailPage from "./pages/documents/DocumentDetailPage";

import FlashCardList from "./pages/flashcards/FlashCardList";
import FlashCard from "./pages/flashcards/FlashCard";

import QuizTake from "./pages/quizzes/QuizTake";
import QuizResult from "./pages/quizzes/QuizResult";

import ProfilePage from "./pages/Profile/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

import TodoPage from "./pages/TodoPage";

import GroupStudy from "./pages/GroupStudy";

import VideoCall from "./pages/VideoCall";

import { useAuth } from "./context/AuthContext";

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
return (
  <Router>
    <Routes>

      {/* Public Routes */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />

          <Route path="/flashcards" element={<FlashCardList />} />
          <Route path="/documents/:id/flashcards" element={<FlashCard />} />

          <Route path="/quizzes/:quizId" element={<QuizTake />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResult />} />

          <Route path="/todos" element={<TodoPage />} />

          <Route path="/group-study" element={<GroupStudy />} />

          <Route path="/video-call" element={<VideoCall />} />
          
          <Route path="/profile" element={<ProfilePage />} />

        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  </Router>
);


};

export default App;
