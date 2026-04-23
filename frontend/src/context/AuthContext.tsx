import { useReducer, createContext, useContext } from "react";
import type { User } from "../types";
import { setAuthToken } from "../lib/api";

type LoginStartAction = {
  type: "LOGIN_START";
};

type LoginSuccessAction = {
  type: "LOGIN-SUCCESS";
  payload: {
    user: User;
    token: string;
  };
};

type LoginFailAction = {
  type: "LOGIN_FAILED";
  payload: string; // error message before backend
};

type LogoutAction = {
  type: "LOGOUT";
};
//basically we telling what is going to happend even before writing logic code

type AuthAction =
  | LoginStartAction
  | LoginSuccessAction
  | LoginFailAction
  | LogoutAction;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initalState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
};

function reducer(state: AuthState, action: AuthAction) {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };

    case "LOGIN-SUCCESS":
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      // Push token to axios immediately so the next request picks it up
      setAuthToken(action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGIN_FAILED":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthToken(null);
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

export const AuthContext = createContext<
  | {
      state: AuthState;
      dispatch: React.Dispatch<AuthAction>;
    }
  | undefined
>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initalState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

//A Custom Hook is simply a JavaScript function that has the superpower of using other React hooks inside it. That's it.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
