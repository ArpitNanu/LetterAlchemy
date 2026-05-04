import { LoginPage } from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";
import { SigupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";
import { Layout } from "./components/Layout/Layout";
import { Bookmark } from "./components/Bookmark";
import { Profile } from "./pages/Profile";
import { ReaderPage } from "./pages/ReaderPage";
import { LandingPage } from "./pages/LandingPage";
//import { FocusMode } from "./components/Reader/FocusMode";

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" index element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/home" index element={<HomePage />} />

          <Route
            path="/bookmark"
            element={
              <ProtectedRoute>
                <Bookmark />
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/post/:id" element={<ReaderPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SigupPage />} />

        <Route
          path="/editor/new"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/reader" element={<FocusMode />} /> */}
      </Routes>
    </>
  );
};
