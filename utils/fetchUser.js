import axios from "axios";
import { setUser } from "../src/Redux/userSlice";
import { API_BASE_URL } from "../constants";
import { toast } from "react-toastify";

export const fetchUser = async (dispatch, lastEmail) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/user/get-user/${lastEmail}`, {
      withCredentials: true,
    });
    dispatch(setUser(res.data));
  } catch (err) {
    console.log("Fetch error:", err);
  }
};
