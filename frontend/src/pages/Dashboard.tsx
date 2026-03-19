import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Dashboard = () => {
  const { state } = useAuth();
  const navigator = useNavigate();
  return (
    <div>
      <h1> Welcome, {state.user?.firstName || "writer"}</h1>

      <button
        className="text-white bg-blue-700 box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
        onClick={() => navigator("/editor")}
      ></button>
    </div>
  );
};

// still confuse b/w usenavigate and navigate
