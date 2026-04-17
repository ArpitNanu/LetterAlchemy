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
        navigate("/layout");
      }
    } catch (error) {
      console.log("Signup error", error);
    }
  };

  return (
    <div className="flex h-screen m-10 gap-2">
      <div className="w-1/2">
        <form
          action=""
          onSubmit={handleSubmit}
          method="post"
          autoComplete="on"
          className="flex gap-4 flex-col "
        >
          <div className="flex gap-2">
            <Input
              name="firstName"
              value={form.firstName}
              label="First Name"
              onChange={handleChange}
              autoComplete="given-name"
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
            label="email"
            onChange={handleChange}
            autoComplete="email"
          />
          <Input
            name="password"
            value={form.password}
            label="Create password"
            onChange={handleChange}
            autoComplete="new-password"
            type="password"
          />
          {/* <Input
            name="Bio"
            value={form.bio}
            label="bio"
            onChange={handleChange}
          /> */}
          <Input
            name="socialLinks"
            value={form.socialLinks}
            label="LinkedIn / Twitter URl"
            onChange={handleChange}
          />
          <button
            type="submit"
            disabled={state.isLoading}
            className={`cursor-pointer p-2 rounded-lg  bg-green-500 text-white active:ring hover:bg-green-600 active:bg-green-600 active:ring-green-400 active:ring-offset-1 ${state.isLoading ? "bg-gray-400" : ""}`}
          >
            Create Account
          </button>
        </form>
      </div>
      <div className="w-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?q=80&w=996&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="typwriter"
        />
      </div>
    </div>
  );
};
