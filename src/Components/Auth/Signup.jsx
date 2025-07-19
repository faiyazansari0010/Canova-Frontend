import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";
import "./Signup.css";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../constants";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      // Signup request to backend
      const response = await axios.post(
        `${API_BASE_URL}/user/signup`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        dispatch(setUser(response.data.user));
        toast.success("Signup successful!");
      } else {
        toast.error(response.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <img src="/MainLogo.png" alt="Main Logo" className="MainLogo" />
      <div className="signup-box">
        <h2>Welcome CANOVA 👋</h2>
        <p>
          Today is a new day. It’s your day. You shape it.
          <br />
          Sign in to start managing your projects.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Example@email.com"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="at least 8 characters"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="at least 8 characters"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button type="submit">Sign up</button>
        </form>
        <p>
          Do you have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
