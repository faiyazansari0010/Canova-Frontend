import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PublishModal.css";
import { moveFormToProject, saveForm, publishForm } from "../Redux/userSlice";
import { API_BASE_URL } from "../../constants";

const PublishModal = ({
  setPublishModalOpen,
  formID,
  formName,
  currentProjectID,
  formPages,
  setFormPages
}) => {
  const navigate = useNavigate()
  const projects = useSelector((state) => state.user.projects);
  const currentProject = projects?.find(
    (project) => project.projectID === currentProjectID
  );
  const currentProjectName = currentProject?.projectName;
  let currentForm = currentProject?.forms?.find(
    (item) => item?.formID === formID
  );

  console.log(currentForm);
  const dispatch = useDispatch();
  const currentUserEmail = useSelector((state) => state.user.email);

  const [selectedProjectID, setSelectedProjectID] = useState("");
  const [accessType, setAccessType] = useState("anyone");
  const [emailInvites, setEmailInvites] = useState([]);

  const [newEmail, setNewEmail] = useState("");
  const [newPermission, setNewPermission] = useState("edit");

  const handlePublish = async () => {
    if (!selectedProjectID) return;

    dispatch(
      moveFormToProject({
        formID,
        sourceProjectID: currentProjectID,
        targetProjectID: selectedProjectID,
      })
    );

    try {
      currentForm = {...currentForm, isDraft:false}
      await axios.post(`${API_BASE_URL}/user/publish-form`, {
        formID,
        formName,
        currentProjectID,
        targetProjectID: selectedProjectID,
        sharedByEmail: currentUserEmail,
        accessType,
        sharedEmails: emailInvites,
        currentProjectName,
        currentForm,
        sharedType:"form",
      });

      dispatch(publishForm({currentProjectID, formID, formPages}))
      navigate("/homepage")
    } catch (err) {
      console.error("Failed to publish:", err);
    }
  };

  return (
    <div
      className="publish-modal-backdrop"
      onClick={() => setPublishModalOpen(false)}
    >
      <div
        className="publish-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="publish-modal-header">
          <h2>Publish Form</h2>
          <button
            className="close-button"
            onClick={() => setPublishModalOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="publish-modal-section">
          <label>Choose a project</label>
          <select
            className="project-dropdown"
            value={selectedProjectID}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedProjectID(e.target.value);
            }}
          >
            <option value="">Select a project</option>
            {projects?.map((project) => (
              <option key={project.projectID} value={project.projectID}>
                {project?.projectName}
              </option>
            ))}
            
          </select>
        </div>

        <div className="publish-modal-section">
          <label>Access</label>
          <div className="access-toggle">
            <button
              className={`access-option ${
                accessType === "anyone" ? "selected" : ""
              }`}
              onClick={() => setAccessType("anyone")}
            >
              Anyone with link
            </button>
            <button
              className={`access-option ${
                accessType === "restricted" ? "selected" : ""
              }`}
              onClick={() => setAccessType("restricted")}
            >
              Restricted
            </button>
          </div>
        </div>

        {accessType === "restricted" && (
          <div className="publish-modal-section restricted-emails">
            <div className="email-row">
              <input
                type="text"
                placeholder="Enter email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <select
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
              >
                <option value="edit">Edit</option>
                <option value="view">View</option>
              </select>
              <button
                onClick={() => {
                  if (!newEmail.trim()) return;
                  setEmailInvites((prev) => [
                    ...prev,
                    { email: newEmail.trim(), permission: newPermission },
                  ]);
                  setNewEmail("");
                  setNewPermission("edit");
                }}
              >
                Add
              </button>
            </div>

            {emailInvites.map((invite, index) => (
              <div key={index} className="email-row">
                <span>{invite.email}</span>
                <select
                  value={invite.permission}
                  onChange={(e) => {
                    const updated = [...emailInvites];
                    if (e.target.value === "remove") {
                      updated.splice(index, 1);
                    } else {
                      updated[index].permission = e.target.value;
                    }
                    setEmailInvites(updated);
                  }}
                >
                  <option value="edit">Edit</option>
                  <option value="view">View</option>
                  <option value="remove">Remove</option>
                </select>
              </div>
            ))}
          </div>
        )}

        <button
          className="publish-button"
          disabled={!selectedProjectID}
          onClick={handlePublish}
        >
          Publish
        </button>
      </div>
    </div>
  );
};

export default PublishModal;
