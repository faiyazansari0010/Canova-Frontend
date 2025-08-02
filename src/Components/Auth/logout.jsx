import axios from "axios";
import { useDispatch } from "react-redux";
import { clearUser } from "../../Redux/userSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../../constants"; // or however you store it

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/user/logout`,
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("lastLoggedInUserEmail");
      dispatch(clearUser());

      toast.success("Logged out!");
      navigate("/user/login"); 
    } catch (err) {
      console.error("Logout error:", err);
      toast.error(err.response?.data?.message || "Could not log out");
    }
  };

  return logout;
};
