import { useState } from "react";
import "./Login.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "../../Redux/userSlice";
import { API_BASE_URL } from "../../../constants";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFormDisabled, setFormDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [step, setStep] = useState("login");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LOGIN HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormDisabled) return;
    setFormDisabled(true);

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please fill all fields");
      setFormDisabled(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/login`,
        { email, password },
        { withCredentials: true }
      );
      if (response.status === 200) {
        dispatch(setUser(response.data));
        toast.success("Login successful!");
        // dispatch(setLoading(false));
        navigate("/homepage");
      } else {
        toast.error("Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setFormDisabled(false);
    }
  };

  // FORGOT PASSWORD: SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (isFormDisabled) return;
    setFormDisabled(true);

    const { email } = formData;

    if (!email) {
      toast.error("Please enter your registered email");
      setFormDisabled(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/user/send-otp`, { email });
      toast.success("OTP sent to your email");
      setStep("sendOTP");
      console.log("sendOtp page");
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setFormDisabled(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isFormDisabled) return;
    setFormDisabled(true);

    const { email, otp } = formData;

    if (!otp || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      setFormDisabled(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/user/verify-otp`, {
        email,
        otp,
      });
      toast.success("OTP verified");
      setStep("resetPassword");
    } catch (err) {
      toast.error("Invalid OTP");
    } finally {
      setFormDisabled(false);
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isFormDisabled) return;
    setFormDisabled(true);

    const { email, newPassword, confirmNewPassword } = formData;

    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill both fields");
      setFormDisabled(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      setFormDisabled(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      setFormDisabled(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/user/reset-password`, {
        email,
        newPassword,
      });
      toast.success("Password reset successful. You can now log in.");
      setFormData({ email: "", password: "" });
      setStep("login");
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setFormDisabled(false);
    }
  };

  return (
    <div className="login-container">
      <img src="/MainIcon.png" alt="CANOVA Logo" className="logo" />

      {step === "login" && (
        <div className="login-box">
          <h2>Welcome CANOVA 👋</h2>
          <p>
            Today is a new day. It’s your day. You shape it. <br />
            Sign in to start managing your projects.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Example@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isFormDisabled}
            />

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="at least 8 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isFormDisabled}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label="Toggle password visibility"
              >
                <img
                  src={showPassword ? "/openEyeIcon.png" : "/closedEyeIcon.JPG"}
                  alt="Toggle Visibility"
                  className="eye-icon"
                />
              </span>
            </div>

            <div className="forgot-password">
              <a onClick={() => setStep("forgotPassword")} tabIndex={0}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" disabled={isFormDisabled}>
              {isFormDisabled ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="signup-link">
            Don’t you have an account? <a href="/user/signup">Sign up</a>
          </p>
        </div>
      )}

      {step === "forgotPassword" && (
        <div className="forgotPasswordPage">
          <h2 className="fp-heading">
            Welcome CANOVA <span className="wave">👋</span>
          </h2>
          <p className="fp-subtext">
            Please enter your registered email ID to receive an OTP
          </p>
          <form className="fp-form" onSubmit={handleSendOtp}>
            <label className="fp-label">E-mail</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              className="fp-input"
              disabled={isFormDisabled}
            />
            <button
              type="submit"
              className="fp-button"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? "Sending..." : "Send Mail"}
            </button>
          </form>
        </div>
      )}

      {step === "sendOTP" && (
        <div className="enterOTPPage">
          <h2 className="otp-heading">Enter Your OTP</h2>
          <p className="otp-subtext">
            We've sent a 6-digit OTP to your registered mail. <br />
            Please enter it below to sign in.
          </p>
          <form className="otp-form" onSubmit={handleVerifyOtp}>
            <label className="otp-label">OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="xxxx05"
              value={formData.otp}
              onChange={handleChange}
              className="otp-input"
              disabled={isFormDisabled}
            />
            <button
              type="submit"
              className="otp-button"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? "Verifying..." : "Confirm"}
            </button>
          </form>
        </div>
      )}

      {step === "resetPassword" && (
        <div className="resetPasswordPage">
          <h2 className="reset-heading">Create New Password</h2>
          <p className="reset-subtext">
            Today is a new day. It’s your day. You shape it. <br />
            Sign in to start managing your projects.
          </p>

          <form className="reset-form" onSubmit={handleResetPassword}>
            <label className="reset-label">Enter New Password</label>
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="At least 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
                className="reset-input"
                disabled={isFormDisabled}
              />
              <span
                className="toggle-password"
                onClick={() => setShowNewPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label="Toggle new password visibility"
              >
                <img
                  src={
                    showNewPassword ? "/openEyeIcon.png" : "/closedEyeIcon.JPG"
                  }
                  alt="Toggle Visibility"
                  className="eye-icon"
                />
              </span>
            </div>

            <label className="reset-label">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                name="confirmNewPassword"
                placeholder="At least 8 characters"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="reset-input"
                disabled={isFormDisabled}
              />
              <span
                className="toggle-password"
                onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label="Toggle confirm password visibility"
              >
                <img
                  src={
                    showConfirmNewPassword
                      ? "/openEyeIcon.png"
                      : "/closedEyeIcon.JPG"
                  }
                  alt="Toggle Visibility"
                  className="eye-icon"
                />
              </span>
            </div>

            <button
              type="submit"
              className="reset-button"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
