import { LoginPage } from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";
import { SigupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";
import { Layout } from "./components/Layout/Layout";
import { Bookmark } from "./components/Bookmark";
import { Profile } from "./components/Profile";

export const App = () => {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" index element={<HomePage />} />

          <Route path="/bookmark" element={<Bookmark />} />

          {/* make book,pro, dash, protected later,*/}
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
              //bcuz it's like bouncer for dashboard
            }
          />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SigupPage />} />

        <Route path="/editor/new" element={<EditorPage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </>
  );
};
