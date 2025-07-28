import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../Redux/userSlice";
import "./Signup.css";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../constants";
import { useNavigate, NavLink } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      console.log(response.data)

      if (response.status === 201) {
        dispatch(setUser(response.data));
        toast.success("Signup successful!");
        dispatch(setLoading(false));
        navigate("/homepage");
      } else {
        toast.error("Signup failed.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <img src="/MainIcon.png" alt="Main Logo" className="MainLogo" />
      <div className="signup-box">
        <h2>Welcome CANOVA 👋</h2>
        <p>
          Today is a new day. It’s your day. You shape it.
          <br />
          Sign in to start managing your projects.
        </p>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Example@email.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="at least 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <img
                src={showPassword ? "/openEyeIcon.png" : "/closedEyeIcon.JPG"}
                alt="Toggle Visibility"
                className="eye-icon"
              />
            </span>
          </div>

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="at least 8 characters"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              <img
                src={
                  showConfirmPassword
                    ? "/openEyeIcon.png"
                    : "/closedEyeIcon.JPG"
                }
                alt="Toggle Visibility"
                className="eye-icon"
              />
            </span>
          </div>

          <button type="submit">Sign up</button>
        </form>

        <p className="login-link">
          Already have an account? <NavLink to="/user/login">Login</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
