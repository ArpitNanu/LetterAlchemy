import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";
import { Input } from "@/components/ui/Input";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { state, dispatch } = useAuth();

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch({ type: "LOGIN_START" });
    console.log("form", { email, password });
    const userForm = {
      email: email,
      password: password,
    };
    try {
      const data = await login(userForm);
      dispatch({
        type: "LOGIN-SUCCESS",
        payload: {
          user: data.user,
          token: data.token,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Login Failed";
      dispatch({ type: "LOGIN_FAILED", payload: message });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-6">
      {/* CARD */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        {/* LEFT → FORM */}
        <div className="flex items-center justify-center p-10">
          <form
            onSubmit={handleSubmit}
            autoComplete="on"
            className="w-full max-w-sm flex flex-col gap-5"
          >
            <h2 className="text-2xl font-semibold text-center">Login</h2>

            <Input
              type="text"
              value={email}
              name="email"
              id="email"
              onChange={handleEmail}
              label="Enter email id"
              autoComplete="email"
            />

            <Input
              value={password}
              type="password"
              name="password"
              id="password"
              onChange={handlePassword}
              label="Enter your password"
              autoComplete="current-password"
            />

            <button
              type="submit"
              className={`rounded-xl p-2 cursor-pointer text-white ${
                state.isLoading
                  ? "bg-gray-400"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Sign in
            </button>
          </form>
        </div>

        {/* RIGHT → IMAGE */}
        <div className="hidden md:block">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg"
            alt="typewriter"
          />
        </div>
      </div>
    </div>
  );
};
