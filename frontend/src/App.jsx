import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import DashboardPage from "./pages/Dashboard/Dashboard";
import DocumentListPage from "./pages/documents/DocumentListPage";
import DocumentDetailPage from "./pages/documents/DocumentDetailPage";

import FlashCardList from "./pages/flashcards/FlashCardList";
import FlashCard from "./pages/flashcards/FlashCard";

import QuizTakePage from "./pages/quizzes/QuizTake";
import QuizResultPage from "./pages/quizzes/QuizResult";
import ProfilePage from "./pages/Profile/ProfilePage";
import NotFoundPage from "./pages/quizzes/NotFoundPage";

import ProtectedRoute from "./components/auth/protectedRoute";

const App = () => {
  const isAuthenticated = false; // replace with real auth later
  const loading = false

  if(loading) {
    return(
      <div classname ="flex item-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  
  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />

          <Route path="/flashcards" element={<FlashCardList />} />
          <Route
            path="/documents/:id/flashcards"
            element={<FlashCard />}
          />

          <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
          <Route
            path="/quizzes/:quizId/results"
            element={<QuizResultPage />}
          />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
