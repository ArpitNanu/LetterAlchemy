import { LoginPage } from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";
import { SigupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";
import { Layout } from "./components/Layout/Layout";
import { Bookmark } from "./components/Bookmark";
import { Profile } from "./components/Profile";
import { ReaderPage } from "./pages/ReaderPage";

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
              <Dashboard />
              //bcuz it's like bouncer for dashboard
            }
          />
        </Route>

        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SigupPage />} />

        <Route path="/editor/new" element={<EditorPage />} />

        <Route path="/editor" element={<EditorPage />} />

        {<Route path="/reader" element={<ReaderPage />} />}
      </Routes>
    </>
  );
};
