import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export const useRequireAuth = () => {
  const { state } = useAuth();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;

  else return <div>
    
  </div>;
};
