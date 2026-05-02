import React, { useState } from "react";
import { SignupSchema } from "../schemas/auth.schema";
import { signUp } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/Input";
import { useNavigate } from "react-router-dom";

export const SigupPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    bio: "",
    socialLinks: "",
  });
  const { state, dispatch } = useAuth();
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: any) => {
    event?.preventDefault();
    dispatch({ type: "LOGIN_START" });

    const reponse = SignupSchema.safeParse(form);
    try {
      if (!reponse.success) {
        const globalMessage = reponse.error.issues[0].message;
        console.log("First error", globalMessage);
        dispatch({
          type: "LOGIN_FAILED",
          payload: globalMessage,
        });
        return console.error();
      } else {
        const data = await signUp(reponse.data);
        dispatch({
          type: "LOGIN-SUCCESS",
          payload: {
            token: data.Authorization,
            user: data.user,
          },
        });
        navigate("/home");
      }
    } catch (error) {
      console.log("Signup error", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 overflow-hidden">
      {/* above is to take whole screen for your mental model */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 h-[90vh]">
        {/* LEFT → FORM */}
        <div className="flex items-center justify-center p-10 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            autoComplete="on"
            className="w-full max-w-md flex flex-col gap-4"
          >
            <h2 className="text-2xl font-semibold text-center mb-2">
              Create Account
            </h2>

            <div className="flex gap-2">
              <Input
                name="firstName"
                value={form.firstName}
                label="First Name"
                onChange={handleChange}
                autoComplete="first-name"
              />
              <Input
                name="lastName"
                value={form.lastName}
                label="Last Name"
                onChange={handleChange}
                autoComplete="family-name"
              />
            </div>

            <Input
              name="email"
              value={form.email}
              label="Email"
              onChange={handleChange}
              autoComplete="email"
            />

            <Input
              name="password"
              value={form.password}
              label="Create password"
              type="password"
              onChange={handleChange}
              autoComplete="new-password"
            />

            <Input
              name="socialLinks"
              value={form.socialLinks}
              label="LinkedIn / Twitter URL"
              onChange={handleChange}
              autoComplete="url"
            />

            <button
              type="submit"
              disabled={state.isLoading}
              className={`p-2 rounded-lg text-white ${
                state.isLoading
                  ? "bg-gray-400"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Create Account
            </button>
          </form>
        </div>

        {/* RIGHT → IMAGE */}
        <div className="hidden md:block">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg"
            alt="signup"
          />
        </div>
      </div>
    </div>
  );
};
