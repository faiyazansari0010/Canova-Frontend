import "./Homepage.css";
import { nanoid } from "nanoid";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addNewForm, addNewProject, clearUser } from "../../Redux/userSlice";

export default function Homepage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [formName, setFormName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects);

  const handleOutsideClick = () => {
    setIsModalOpen(false);
  };

  const handleCreateProject = () => {
    if (!projectName || !formName) {
      toast.error("Please fill all details!");
      return;
    }

    const projectNameLower = projectName.trim().toLowerCase();
    const formNameLower = formName.trim().toLowerCase();

    let projectExists = false;
    let formExists = false;

    projectExists = projects?.some(
      (project) => project.projectName.trim().toLowerCase() === projectNameLower
    );

    formExists = projects?.some((project) =>
      project.forms?.some(
        (form) => form.formName.trim().toLowerCase() === formNameLower
      )
    );

    if (projectExists) {
      toast.error("Project name already exists. Choose a unique project name.");
      return;
    }

    if (formExists) {
      toast.error("Form name already exists. Choose a unique form name.");
      return;
    }

    const projectID = nanoid();

    dispatch(addNewProject({ projectName: projectName, projectID: projectID }));
    dispatch(
      addNewForm({ formName: formName, formID: nanoid(), projectID: projectID })
    );
    navigate("/createForm");
    setIsModalOpen(false);
  };

  return (
    <div className="homepage-root">
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => navigate("/homepage")}>
          <img src="/homepageIcon.png" alt="" />
          <span className="logo">CANOVA</span>
        </div>
        <nav className="nav-menu">
          <a className="nav-item nav-item-active" href="#">
            <span className="nav-icon">
              <img src="/homeIcon.png" alt="Home icon" className="nav-image" />
            </span>
            Home
          </a>
          <a className="nav-item" href="#">
            <span className="nav-icon">
              <img
                src="/analysisIcon.png"
                alt="Analysis icon"
                className="nav-image"
              />
            </span>
            Analysis
          </a>
          <a className="nav-item" href="#">
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
          <span className="profile-icon">
            <img
              src="/profileIcon.png"
              alt="Profile icon"
              className="profile-image"
            />
          </span>
          <span className="profile-text">Profile</span>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-section">
          <h1 className="welcome-header">Welcome to CANOVA</h1>
          <div className="quick-actions">
            <div className="quick-card" onClick={() => setIsModalOpen(true)}>
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
            <div className="quick-card">
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
          <div className="work-card">
            <div className="work-title">Form Name (Draft)</div>
            <div className="work-icon">
              <img src="/formIcon.png" alt="Form icon" className="work-image" />
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

          <div className="work-card">
            <div className="work-title">Form Name</div>
            <div className="work-icon">
              <img src="/formIcon.png" alt="Form icon" className="work-image" />
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

            <div className="work-title">Project Name</div>

            <div className="work-menu">
              <img
                src="/cardmenuIcon.png"
                alt="Card menu icon"
                className="work-menu-image"
              />
            </div>
          </div>
        </div>

        <div className="section-title">Shared Works</div>

        <div className="works-grid">
          <div className="work-card">
            <div className="work-title">Form Name</div>
            <div className="work-icon">
              <img src="/formIcon.png" alt="Form icon" className="work-image" />
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
            <div className="work-title">Project Name</div>
            <div className="work-menu">
              <img
                src="/cardmenuIcon.png"
                alt="Card menu icon"
                className="work-menu-image"
              />
            </div>
          </div>
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
      </main>
    </div>
  );
}
