import "./Homepage.css";
import { nanoid } from "nanoid";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewForm,
  addNewProject,
  clearUser,
  updateUserDetails,
} from "../../Redux/userSlice";
import { API_BASE_URL } from "../../../constants";
import { useLogout } from "../Auth/logout";

export default function Homepage() {
  const logout = useLogout();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [formName, setFormName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.user.projects);
  const { name, email } = useSelector((state) => state.user);
  const currentEmail = email;
  const sharedWorks = useSelector((state) => state.user.sharedWorks);

  const handleCreateProject = async () => {
    try {
      if (!projectName || !formName) {
        toast.error("Please fill all details!");
        return;
      }

      const projectNameLower = projectName.trim().toLowerCase();
      const formNameLower = formName.trim().toLowerCase();

      const projectExists = projects?.some(
        (project) =>
          project.projectName.trim().toLowerCase() === projectNameLower
      );

      if (projectExists) {
        toast.error(
          "Project name already exists. Choose a unique project name."
        );
        return;
      }

      const formExists = projects?.some((project) =>
        project?.forms?.some(
          (form) => form?.formName?.trim().toLowerCase() === formNameLower
        )
      );

      if (formExists) {
        toast.error("Form name already exists. Choose a unique form name.");
        return;
      }

      const projectID = nanoid();
      const formID = nanoid();

      dispatch(addNewProject({ projectName, projectID }));
      dispatch(addNewForm({ formName, formID, projectID }));

      const currentForm = {
        formName,
        formID,
        isDraft: true,
        formPages: [],
      };

      navigate(`/createForm/${projectID}/${formID}`);

      try {
        await axios.post(`${API_BASE_URL}/user/saveForm`, {
          formID,
          currentProjectID: projectID,
          currentProjectName: projectName,
          targetProjectID: projectID,
          sharedByEmail: email,
          currentForm,
        });
        console.log("POST successful");
      } catch (error) {
        console.error("POST error:", error);
        toast.error("Form save failed.");
        return; // prevent navigating if save fails
      }

      toast.success("Project and form created successfully!");

      setProjectName("");
      setFormName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);

      if (error.response) {
        toast.error(error.response.data?.message || "Server error occurred");
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleOutsideClick = () => {
    setIsModalOpen(false);
  };

  const handleCreateStandaloneForm = async () => {
    try {
      if (!email) {
        toast.error("User email is required");
        return;
      }

      // Generate unique names with timestamp to avoid conflicts
      const projectName = `New Project`;
      const formName = `My New Form`;

      const projectID = nanoid();
      const formID = nanoid();

      dispatch(addNewProject({ projectName, projectID }));
      dispatch(addNewForm({ formName, formID, projectID }));

      const currentForm = {
        formName,
        formID,
        isDraft: true,
        formPages: [],
      };

      navigate(`/createForm/${projectID}/${formID}`);

      await axios.post(`${API_BASE_URL}/user/saveForm`, {
        formID,
        currentProjectID: projectID,
        currentProjectName: projectName,
        targetProjectID: projectID,
        sharedByEmail: email,
        currentForm,
      });

      toast.success("Standalone form created successfully!");
    } catch (error) {
      console.error("Error creating standalone form:", error);

      if (error.response) {
        toast.error(error.response.data?.message || "Server error occurred");
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const [mainContent, setMainContent] = useState({
    profile: false,
    home: true,
    analysis: false,
    project: false,
  });
  const [userDetails, setUserDetails] = useState({
    userName: name || "Your name",
    userEmail: email || "youremail@example.com",
  });

  const handleProfileSave = async () => {
    try {
      dispatch(
        updateUserDetails({
          name: userDetails.userName,
          email: userDetails.userEmail,
        })
      );

      await axios.post(`${API_BASE_URL}/user/updateUserData`, {
        name: userDetails.userName,
        email: userDetails.userEmail,
        currentEmail: currentEmail,
      });

      console.log("first");

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="homepage-root">
      <aside className="sidebar">
        <div
          className="sidebar-header"
          onClick={() => {
            navigate("/homepage");
            setMainContent({
              home: true,
              analysis: false,
              projects: false,
              profile: false,
            });
          }}
        >
          <img src="/homepageIcon.png" alt="" />
          <span className="logo">CANOVA</span>
        </div>
        <nav className="nav-menu">
          <a
            className={`nav-item ${mainContent.home ? "nav-item-active" : ""}`}
            onClick={() =>
              setMainContent({
                analysis: false,
                projects: false,
                profile: false,
                home: true,
              })
            }
          >
            <span className="nav-icon">
              <img src="/homeIcon.png" alt="Home icon" className="nav-image" />
            </span>
            Home
          </a>
          <a
            className={`nav-item ${
              mainContent.analysis ? "nav-item-active" : ""
            }`}
            onClick={() =>
              setMainContent({
                analysis: true,
                projects: false,
                profile: false,
                home: false,
              })
            }
          >
            <span className="nav-icon">
              <img
                src="/analysisIcon.png"
                alt="Analysis icon"
                className="nav-image"
              />
            </span>
            Analysis
          </a>
          <a
            className={`nav-item ${
              mainContent.projects ? "nav-item-active" : ""
            }`}
            onClick={() =>
              setMainContent({
                analysis: false,
                projects: true,
                profile: false,
                home: false,
              })
            }
          >
            <span className="nav-icon">
              <img
                src="/projectsIcon.png"
                alt="Projects icon"
                className="nav-image"
              />
            </span>
            Projects
          </a>
        </nav>
        <div className="sidebar-footer">
          <a
            style={{ width: "80%" }}
            className={`nav-item ${
              mainContent.profile ? "nav-item-active" : ""
            }`}
            onClick={() =>
              setMainContent({
                analysis: false,
                projects: false,
                profile: true,
                home: false,
              })
            }
          >
            <span className="profile-icon">
              <img
                src="/profileIcon.png"
                alt="Profile icon"
                className="profile-image"
              />
            </span>
            <span className="profile-text">Profile</span>
          </a>
        </div>
      </aside>

      <main className="main-content">
        {mainContent.home && (
          <>
            <div className="top-section">
              <h1 className="welcome-header">Welcome to CANOVA</h1>
              <div className="quick-actions">
                <div
                  className="quick-card"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="quick-icon">
                    <img
                      src="/projectIcon.png"
                      alt="Start from scratch icon"
                      className="quick-image"
                    />
                  </div>
                  <div className="quick-title">Start From scratch</div>
                  <div className="quick-sub">Create your first Project now</div>
                </div>
                <div
                  className="quick-card"
                  onClick={() => handleCreateStandaloneForm()}
                >
                  <div className="quick-icon">
                    <img
                      src="/formIcon.png"
                      alt="Create form icon"
                      className="quick-image"
                    />
                  </div>
                  <div className="quick-title">Create Form</div>
                  <div className="quick-sub">create your first Form now</div>
                </div>
              </div>
            </div>

            <div className="section-title">Recent Works</div>
            <div className="works-grid">
              {projects.map((project) => {
                return project.forms.map((form) => {
                  return (
                    <div
                      key={form?.id || form?.formName}
                      className="work-card"
                      onClick={() =>
                        navigate(
                          `/createForm/${project.projectID}/${form.formID}`
                        )
                      }
                    >
                      <div className="work-title">
                        {`${form?.formName} ${
                          form?.isDraft === true ? "(Draft)" : ""
                        }`}
                      </div>
                      <div className="work-icon">
                        <img
                          src="/formIcon.png"
                          alt="Form icon"
                          className="work-image"
                        />
                      </div>
                      <a className="analysis-link" href="#">
                        View Analysis
                      </a>
                      <div className="work-menu">
                        <img
                          src="/cardmenuIcon.png"
                          alt="Card menu icon"
                          className="work-menu-image"
                        />
                      </div>
                    </div>
                  );
                });
              })}

              {projects.map((project) => {
                return (
                  <div className="work-card-project">
                    <div className="work-card-upper">
                      <div className="work-icon">
                        <img
                          src="/projectIcon.png"
                          alt="Project icon"
                          className="work-image"
                        />
                      </div>
                    </div>

                    <div className="work-title">{project.projectName}</div>

                    <div className="work-menu">
                      <img
                        src="/cardmenuIcon.png"
                        alt="Card menu icon"
                        className="work-menu-image"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-title">Shared Works</div>

            <div className="works-grid">
              {sharedWorks?.map((project) => {
                return project?.formData?.map((form) => {
                  return (
                    <div
                      key={form?.id || form?.formName}
                      className="work-card"
                      onClick={() =>
                        navigate(
                          `/createForm/${project.projectID}/${form.formID}`
                        )
                      }
                    >
                      <div className="work-title">
                        {`${form?.formName} ${
                          form?.isDraft === true ? "(Draft)" : ""
                        }`}
                      </div>
                      <div className="work-icon">
                        <img
                          src="/formIcon.png"
                          alt="Form icon"
                          className="work-image"
                        />
                      </div>
                      <a className="analysis-link" href="#">
                        View Analysis
                      </a>
                      <div className="work-menu">
                        <img
                          src="/cardmenuIcon.png"
                          alt="Card menu icon"
                          className="work-menu-image"
                        />
                      </div>
                    </div>
                  );
                });
              })}

              {sharedWorks?.map((project) => {
                return (
                  <div className="work-card-project">
                    <div className="work-card-upper">
                      <div className="work-icon">
                        <img
                          src="/projectIcon.png"
                          alt="Project icon"
                          className="work-image"
                        />
                      </div>
                    </div>

                    <div className="work-title">{project.projectName}</div>

                    <div className="work-menu">
                      <img
                        src="/cardmenuIcon.png"
                        alt="Card menu icon"
                        className="work-menu-image"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {isModalOpen && (
              <div className="modal-overlay" onClick={handleOutsideClick}>
                <div
                  className="create-project-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <span>
                      <img
                        src="/modalLogo.png"
                        alt="modal logo"
                        className="modal-logo"
                      />
                    </span>
                    <button
                      className="modal-close-button"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <img src="/modalCloseIcon.png" alt="modalCloseIcon" />
                    </button>
                  </div>
                  <h3>Create Project</h3>
                  <p className="modal-subtitle">
                    Provide your project a name and start with your journey
                  </p>

                  <label className="modal-label">Project Name</label>
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="modal-input"
                  />

                  <label className="modal-label">Form Name</label>
                  <input
                    type="text"
                    placeholder="Form Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="modal-input"
                  />

                  <button
                    className="modal-create-button"
                    onClick={handleCreateProject}
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {mainContent.profile && (
          <>
            <div className="profile-container">
              <div className="profile-header">
                <h2>My Profile</h2>
              </div>

              <div
                className="profile-content"
                style={{ background: "#f0f0f0" }}
              >
                <div className="profile-info">
                  <div className="avatar-section">
                    <div style={{ display: "flex" }}>
                      <div className="avatar">
                        <img src="/profileIcon.png" alt="Profile" />
                      </div>
                      <div className="user-details">
                        <div className="user-name">{name}</div>
                        <div className="user-email">{email}</div>
                      </div>
                    </div>

                    <button
                      style={{ borderColor: "transparent", cursor: "pointer" }}
                      onClick={logout}
                      className="btn-logout"
                    >
                      <img src="/logoutIcon.png" alt="" />
                    </button>
                  </div>

                  <div className="form-fields">
                    <div className="field-row">
                      <label className="field-label">Name</label>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="your name"
                        value={userDetails.userName}
                        onChange={(e) =>
                          setUserDetails({
                            ...userDetails,
                            userName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field-row">
                      <label className="field-label">Email account</label>
                      <input
                        type="email"
                        className="field-input"
                        placeholder="yourname@gmail.com"
                        value={userDetails.userEmail}
                        onChange={(e) =>
                          setUserDetails({
                            ...userDetails,
                            userEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      className="save-button"
                      onClick={() => handleProfileSave()}
                    >
                      Save Changes
                    </button>
                    <button
                      className="discard-button"
                      onClick={() =>
                        setUserDetails({ userName: "", userEmail: "" })
                      }
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {mainContent.projects && (
          <>
            <h1 style={{padding:"40px"}}>Projects</h1>
            <div className="works-grid">

              {projects.map((project) => {
                return (
                  <div className="work-card-project">
                    <div className="work-card-upper">
                      <div className="work-icon">
                        <img
                          src="/projectIcon.png"
                          alt="Project icon"
                          className="work-image"
                        />
                      </div>
                    </div>

                    <div className="work-title">{project.projectName}</div>

                    <div className="work-menu">
                      <img
                        src="/cardmenuIcon.png"
                        alt="Card menu icon"
                        className="work-menu-image"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
