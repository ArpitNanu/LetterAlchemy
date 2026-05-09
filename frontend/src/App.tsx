import { lazy, Suspense } from "react";
import { LoginPage } from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";
import { SigupPage } from "./pages/SignupPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { HomePage } from "./pages/HomePage";
import { Layout } from "./components/Layout/Layout";
import { LandingPage } from "./pages/LandingPage";

const Dashboard = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.Dashboard })));
const EditorPage = lazy(() => import("./pages/EditorPage").then(m => ({ default: m.EditorPage })));
const Bookmark = lazy(() => import("./components/Bookmark").then(m => ({ default: m.Bookmark })));
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const ReaderPage = lazy(() => import("./pages/ReaderPage").then(m => ({ default: m.ReaderPage })));

export const App = () => {
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center h-screen font-medium text-gray-500">Loading...</div>}>
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
          {/* 
            WHY :slug instead of :id?
            React Router reads the URL segment after /post/ and puts it in useParams().
            If we write :id,  useParams() gives us { id: "42" }        ← number as string
            If we write :slug, useParams() gives us { slug: "my-post" } ← human readable
            The name here MUST match what we call useParams() with in ReaderPage.
          */}
          <Route path="/post/:slug" element={<ReaderPage />} />
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
      </Suspense>
    </>
  );
};
