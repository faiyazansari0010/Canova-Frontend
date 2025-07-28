import { useParams, useNavigate } from "react-router-dom";
import "./CreateForm.css";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import QuestionBlock from "./QuestionBlock";
import { API_BASE_URL } from "../../../constants";
import axios from "axios";

const CreateFormLayout = () => {
  const navigate = useNavigate();
  const { pageID } = useParams();
  const [formPages, setFormPages] = useState([]);
  const pageExists = formPages.some((page) => page.pageID === pageID);
  const currentPage = formPages.find((page) => page.pageID === pageID);
  console.log(currentPage);
  const isPageSelected =
    pageID !== undefined && pageID !== null && pageID !== "" && pageExists;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (pageID && !formPages.some((page) => page.pageID === pageID)) {
      navigate("/createForm", { replace: true });
    }
  }, [pageID, formPages, navigate]);

  const handleAddPage = () => {
    const newPageID = nanoid();
    const newPage = {
      pageID: newPageID,
      pageName: `Page ${formPages.length + 1}`,
      isEditing: false,
      pageQuestions: [],
    };
    setFormPages([...formPages, newPage]);
    navigate(`/createForm/${newPageID}`);
  };

  const handleAddQuestion = () => {
    if (formPages.length === 0) {
      toast.info("Please add atleast one page to start adding questions!");
      return;
    }
    setFormPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageID === pageID) {
          const newQuestionNum = page.pageQuestions.length + 1;

          const newQuestion = {
            questionID: nanoid(),
            questionNum: newQuestionNum,
            questionName: "What is ?",
            questionType: "Multiple Choice",
            userResponse: "",
            isEditing: false,
            options: [
              {
                optionID: nanoid(),
                optionType: "radio",
                optionName: "Option 1",
                isEditing: false,
              },
              {
                optionID: nanoid(),
                optionType: "radio",
                optionName: "Option 2",
                isEditing: false,
              },
            ],
          };

          return {
            ...page,
            pageQuestions: [...page.pageQuestions, newQuestion],
          };
        }
        return page;
      })
    );
  };

  const handleAddQuestionText = () => {
    const updated = [...currentPage.pageQuestions];
    if (updated.length === 0) return;

    const lastQuestion = updated[updated.length - 1];
    lastQuestion.questionText = "";
    lastQuestion.isEditingQuestionText = true;

    setFormPages((prev) =>
      prev.map((page) =>
        page.pageID === pageID ? { ...page, pageQuestions: updated } : page
      )
    );
  };

  const handlePageName = (index) => {
    setFormPages((prev) =>
      prev.map((p, i) => {
        if (i === index) {
          const trimmedName = p.pageName.trim();

          const isEmpty = trimmedName === "";

          const isDuplicate = prev.some(
            (otherPage, j) =>
              j !== i &&
              otherPage.pageName.trim().toLowerCase() ===
                trimmedName.toLowerCase()
          );

          if (isEmpty) {
            toast.info("Page name can't be empty. Reverted to default.");
            return {
              ...p,
              isEditing: false,
              pageName: `Page ${i + 1}`,
            };
          }

          if (isDuplicate) {
            toast.info("Duplicate page name not allowed. Reverted to default.");
            return {
              ...p,
              isEditing: false,
              pageName: `Page ${i + 1}`,
            };
          }

          return {
            ...p,
            isEditing: false,
            pageName: trimmedName,
          };
        }
        return p;
      })
    );
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", uploadType);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/user/upload?type=${uploadType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data;

      const updatedPages = [...formPages];
      const pageIndex = updatedPages.findIndex((p) => p.pageID === pageID);
      const questions = updatedPages[pageIndex].pageQuestions;

      if (questions.length === 0) return;

      const lastQuestion = questions[questions.length - 1];

      if (uploadType === "image") {
        lastQuestion.questionImage = data.url;
      } else if (uploadType === "video") {
        lastQuestion.questionVideo = data.url;
      } else if (uploadType === "pdf") {
        lastQuestion.questionPDF = data.url;
      } else if (uploadType === "zip") {
        lastQuestion.questionZIP = data.url;
      } else if (uploadType === "audio") {
        lastQuestion.questionAudio = data.url;
      } else if (uploadType === "ppt") {
        lastQuestion.questionPPT = data.url;
      } else if (uploadType === "spreadsheet") {
        lastQuestion.questionSpreadsheet = data.url;
      } else if (uploadType === "document") {
        lastQuestion.questionDocument = data.url;
      }

      updatedPages[pageIndex].pageQuestions = questions;
      setFormPages(updatedPages);

      toast.success("File uploaded successfully!");
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const MAX_FILE_SIZE_MB = 200;

    const file = e.target.files[0];
    if (!file) return;

    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (file.size > maxBytes) {
      toast.error(`File too large! Max ${MAX_FILE_SIZE_MB}MB allowed.`);
      return;
    }

    setSelectedFile(file);
  };

  return (
    <div className="create-form-container">
      <div className="left-sidebar">
        <div className="sidebar-logo">
          <img src="/homepageIcon.png" alt="homepageIcon" />
          <span className="logo">CANOVA</span>
        </div>
        <div className="sidebar-scrollable">
          <div className="sidebar-pages">
            {formPages.map((page, index) => (
              <div
                key={page.pageID}
                className={`sidebar-page-item ${
                  page.pageID === pageID ? "active" : ""
                }`}
                onClick={() => {
                  if (!page.isEditing) {
                    navigate(`/createForm/${page.pageID}`);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation(); // Prevent navigate on double-click
                  setFormPages((prev) =>
                    prev.map((p, i) =>
                      i === index
                        ? { ...p, isEditing: true }
                        : { ...p, isEditing: false }
                    )
                  );
                }}
              >
                {page.isEditing ? (
                  <input
                    type="text"
                    className="pageNameInputBox"
                    value={page.pageName}
                    autoFocus
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormPages((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, pageName: newName } : p
                        )
                      );
                    }}
                    onBlur={() => handlePageName(index)}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering navigation
                  />
                ) : (
                  <span className="pageNameText">{page.pageName}</span>
                )}
              </div>
            ))}
          </div>
          <button className="add-page-btn" onClick={handleAddPage}>
            <img src="/addPageIcon.png" alt="add page icon" />
            <span>Add new Page</span>
          </button>
        </div>

        <div className="profile-btn">
          <img src="/profileIcon.png" alt="Profile Icon" />
          <span>Profile</span>
        </div>
      </div>

      {isPageSelected && (
        <div className="form-header">
          <h2 className="form-title">{currentPage.pageName}</h2>
          <div className="form-header-buttons">
            <button className="preview-btn">Preview</button>
            <button className="save-btn">Save</button>
          </div>
        </div>
      )}

      <div className="form-body">
        {showUploadModal && (
          <div
            className="upload-modal-overlay"
            onClick={() => setShowUploadModal(false)}
          >
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
              <img
                src="/modalCloseIcon.png"
                alt="Close"
                className="close-icon"
                onClick={() => setShowUploadModal(false)}
              />

              <h3>Upload a {uploadType}</h3>

              <div
                className={`upload-dropzone ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  handleFileChange({ target: { files: [file] } });
                }}
              >
                <p>Drag & drop your {uploadType} here or click to browse</p>

                <input
                  type="file"
                  accept={
                    uploadType === "image"
                      ? "image/*"
                      : uploadType === "video"
                      ? "video/*"
                      : uploadType === "pdf"
                      ? ".pdf"
                      : uploadType === "zip"
                      ? ".zip"
                      : uploadType === "audio"
                      ? "audio/*"
                      : uploadType === "ppt"
                      ? ".ppt,.pptx"
                      : uploadType === "spreadsheet"
                      ? ".xls,.xlsx"
                      : uploadType === "document"
                      ? ".doc,.docx,.txt"
                      : "*"
                  }
                  onChange={handleFileChange}
                />
              </div>

              {selectedFile && (
                <p style={{ marginTop: "10px", color: "#333" }}>
                  Selected: <strong>{selectedFile.name}</strong>
                </p>
              )}

              <button onClick={uploadFile}>Upload File</button>
            </div>
          </div>
        )}

        {isPageSelected && (
          <QuestionBlock formPages={formPages} setFormPages={setFormPages} />
        )}
      </div>

      <div className="right-sidebar">
        <button onClick={handleAddQuestion} className="tool-button">
          <img src="/addQuestionIcon.png" alt="Add Question" />
          Add Question
        </button>
        <button
          onClick={() => {
            if (
              currentPage?.pageQuestions?.length === 0 ||
              formPages?.length === 0
            ) {
              toast.info("Add at least one question to start adding Text");
              return;
            }
            handleAddQuestionText();
          }}
          className="tool-button"
        >
          <img src="/addTextIcon.png" alt="Add Text" />
          Add Text
        </button>
        <button className="tool-button">
          <img src="/addConditionIcon.png" alt="Add Condition" />
          Add Condition
        </button>
        <button
          className="tool-button"
          onClick={() => {
            if (
              currentPage?.pageQuestions?.length === 0 ||
              formPages?.length === 0
            ) {
              toast.info("Add at least one question to start adding image");
              return;
            }
            setUploadType("image");
            setShowUploadModal(true);
          }}
        >
          <img src="/addImageIcon.png" alt="Add Image" />
          Add Image
        </button>
        <button
          className="tool-button"
          onClick={() => {
            if (
              currentPage?.pageQuestions?.length === 0 ||
              formPages?.length === 0
            ) {
              toast.info("Add at least one question to start adding video");
              return;
            }
            setUploadType("video");
            setShowUploadModal(true);
          }}
        >
          <img src="/addVideoIcon.png" alt="Add Video" />
          Add Video
        </button>
        <button className="tool-button">
          <img src="/addSectionIcon.png" alt="Add Sections" />
          Add Sections
        </button>

        <div className="color-picker-group">
          <label>Background Color</label>
          <div className="color-input-row">
            <div className="color-box" style={{ background: "#B6B6B6" }}></div>
            <span>B6B6B6</span>
            <span>100%</span>
          </div>

          <label>Section Color</label>
          <div className="color-input-row">
            <div className="color-box" style={{ background: "#B6B6B6" }}></div>
            <span>B6B6B6</span>
            <span>100%</span>
          </div>
        </div>

        <button className="next-btn">Next</button>
      </div>
    </div>
  );
};

export default CreateFormLayout;
