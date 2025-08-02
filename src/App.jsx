import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUser } from "../utils/fetchUser";
import { useDispatch, useSelector } from "react-redux";
import Homepage from "./Components/Homepage/Homepage";
import CreateFormLayout from "./Components/CreateForm/CreateFormLayout";

const App = () => {
  const dispatch = useDispatch();
  const { email: userEmail } = useSelector((state) => state.user);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const lastEmail = localStorage.getItem("lastLoggedInUserEmail");
    const init = async () => {
      await fetchUser(dispatch, lastEmail);
      setAppReady(true);
    };
    init();
  }, [userEmail]);

  if (!appReady) return <h1>Loading...</h1>;

  return (
    <Router>
      <Routes>
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/login" element={<Login />} />

        <Route
          path="/homepage"
          element={
            userEmail !== "" ? <Homepage /> : <Navigate to="/user/login" />
          }
        />
        <Route
          path="/createForm/:projectID/:formID"
          element={
            userEmail !== "" ? (
              <CreateFormLayout />
            ) : (
              <Navigate to="/user/login" />
            )
          }
        />
        <Route
          path="/createForm/:projectID/:formID/:pageID"
          element={
            userEmail !== "" ? (
              <CreateFormLayout />
            ) : (
              <Navigate to="/user/login" />
            )
          }
        />

        <Route
          path="/"
          element={
            userEmail !== "" ? (
              <Navigate to="/homepage" />
            ) : (
              <Navigate to="/user/login" />
            )
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
      />
    </Router>
  );
};

export default App;
