import { useState } from "react";
import { SignupSchema } from "../schemas/auth.schema";
import { signUp } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export const SigupPage = () => {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    bio: "",
    socialLinks: "",
  });
  const { state, dispatch } = useAuth();
  const handleChange = (event: any) => {
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
      }
    } catch (error) {}
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        action=""
        onSubmit={handleSubmit}
        method="post"
        autoComplete="on"
        className="flex gap-4 flex-col "
      >
        <label>email</label>
        <input
          type="text"
          name="email"
          id="FirstName"
          placeholder="email"
          className="border"
          onChange={handleChange}
        />
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          id=""
          placeholder="First Name"
          className="border"
          onChange={handleChange}
        />
        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          id=""
          placeholder="Last Name"
          className="border"
          onChange={handleChange}
        />
        <label>Password</label>
        <input
          type="text"
          name="password"
          id=""
          placeholder="Password"
          className="border"
          onChange={handleChange}
        />
        <label>Bio</label>
        <input
          type="text"
          name="bio"
          id=""
          placeholder="tell me about yourself"
          className="border"
          onChange={handleChange}
        />
        <label>socialLinks</label>
        <input
          type="text"
          name="socialLinks"
          id=""
          placeholder="your linkedIn, X(formelyTwitter) links"
          className="border"
          onChange={handleChange}
        />
        <input
          type="submit"
          value={state.isLoading ? "Creating new account" : "Sign up"}
          disabled={state.isLoading}
          className={`cursor-pointer p-2 rounded-lg ${state.isLoading ? "bg-gray-400" : "bg-green-600 text-white"}`}
        ></input>
      </form>
    </div>
  );
};
