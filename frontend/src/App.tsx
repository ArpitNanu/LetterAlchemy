import { LoginPage } from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";
import { SigupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const App = () => {
  return (
    <>
      <Routes>
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
      </Routes>
    </>
  );
};
