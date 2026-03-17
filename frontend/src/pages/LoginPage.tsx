import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import login from "../services/authService";

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
    <div className="flex justify-center h-screen items-center">
      <form
        onSubmit={handleSubmit}
        className=" border-2 border-solid flex flex-col justify-center items-center p-2 rounded-2xl gap-4 "
      >
        <label htmlFor="email">Login</label>
        <label>Email</label>
        <input
          type="text"
          value={email}
          name="email"
          id="email "
          onChange={handleEmail}
          placeholder="Enter your Email"
          className="p-4 border rounded-xl w-full h-10"
        />
        <label htmlFor="password">Password</label>
        <input
          value={password}
          type="password"
          name="password"
          id="password"
          onChange={handlePassword}
          placeholder="Enter your Password"
          className="border p-4  rounded-xl w-full h-10"
        />
        <br />
        <input
          className={`rounded-xl p-2 w-full ${state.isLoading ? "bg-gray-200" : "bg-blue-500"}`}
          disabled={state.isLoading}
          type="submit"
          value={state.isLoading ? "Logging In..." : "Log In"}
        />
      </form>
    </div>
  );
};
