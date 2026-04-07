import { LoginPage } from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";
import { SigupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";

export const App = () => {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SigupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
            //bcuz it's like bouncer for dashboard
          }
        />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </>
  );
};
