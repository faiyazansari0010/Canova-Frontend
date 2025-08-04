import { useParams, useNavigate } from "react-router-dom";
import "./CreateForm.css";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import QuestionBlock from "./QuestionBlock";
import ConditionModeView from "../ConditionModeView";
import { API_BASE_URL } from "../../../constants";
import NextPageButton from "../NextPageButton";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import FlowChart from "../FlowChart";
import { saveForm } from "../../Redux/userSlice";
import PublishModal from "../PublishModal";
import { useLogout } from "../Auth/logout";

const CreateFormLayout = () => {
  const logout = useLogout();
  const { pageID, projectID, formID } = useParams();
  let projects = useSelector((state) => state.user.projects);
  let project = projects?.find((p) => p.projectID === projectID);
  let form = project?.forms?.find((f) => f?.formID === formID);

  const sharedWorks = useSelector((state) => state?.user?.sharedWorks);

  console.log(sharedWorks);

  sharedWorks.map((item) => {
    if (item?.projectID === projectID) {
      project = item;
      form = item.formData.find((item1) => item1.formID === formID);
    }
  });

  console.log(project, form);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formPages, setFormPages] = useState(form?.formPages || []);
  const pageExists = formPages.some((page) => page.pageID === pageID);
  const currentPage = formPages.find((page) => page.pageID === pageID);
  const isPageSelected =
    pageID !== undefined && pageID !== null && pageID !== "" && pageExists;

  const currentFormName = form?.formName;

  console.log(formPages);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [sectionColor, setSectionColor] = useState("#B6B6B6");
  const [sectionOpacity, setSectionOpacity] = useState(100);

  const [isEditingSectionColor, setIsEditingSectionColor] = useState(false);
  const [isEditingSectionOpacity, setIsEditingSectionOpacity] = useState(false);

  const [formBodyBgColor, setFormBodyBgColor] = useState("#FFFFFF"); // default white
  const [formBodyOpacity, setFormBodyOpacity] = useState(100); // default 100%

  const [isEditingFormBodyColor, setIsEditingFormBodyColor] = useState(false);
  const [isEditingFormBodyOpacity, setIsEditingFormBodyOpacity] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] = useState({
    insideSection: false,
    sectionIndex: null,
  });

  const [publishModalOpen, setPublishModalOpen] = useState(false);

  useEffect(() => {
    if (pageID && !formPages.some((page) => page.pageID === pageID)) {
      navigate(`/createForm/${projectID}/${formID}`, { replace: true });
    }
  }, [pageID, formPages, navigate]);

  const [showFlowChart, setShowFlowChart] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const email = useSelector((state) => state.user.email);

  const mainContent = useSelector((state) => state.user.mainContent);

  function getRgbaColor(inputColor, opacity) {
    // Support color names, hex, rgb(a)
    let d = document.createElement("div");
    d.style.color = inputColor;
    document.body.appendChild(d);
    const computed = window.getComputedStyle(d).color;
    document.body.removeChild(d);

    const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) {
      // Fallback for invalid color
      return `rgba(182,182,182,${opacity})`; // default B6B6B6
    }
    const [r, g, b] = match.slice(1);
    return `rgba(${r},${g},${b},${opacity})`;
  }

  const handleAddPage = () => {
    const newPageID = nanoid();
    const rgbaColor = getRgbaColor(formBodyBgColor, formBodyOpacity / 100);

    const newPage = {
      isConditionMode: false,
      pageBgColor: rgbaColor,
      pageBgOpacity: formBodyOpacity,
      pageID: newPageID,
      pageName: `Page ${formPages.length + 1}`,
      isEditing: false,
      pageQuestions: [],
      pageSections: [],
    };
    setFormPages([...formPages, newPage]);
    navigate(`/createForm/${projectID}/${formID}/${newPageID}`);
  };

  const handleToggleConditionMode = () => {
    const allQuestions = [
      ...currentPage?.pageQuestions,
      ...currentPage?.pageSections?.flatMap((section) => section.questions),
    ];

    const hasQuestions = allQuestions.length > 0;

    if (!hasQuestions) {
      toast.info(
        "Add and answer at least one question before setting a condition."
      );
      return;
    }

    setFormPages((prevPages) =>
      prevPages.map((page) =>
        page.pageID === pageID ? { ...page, isConditionMode: true } : page
      )
    );
  };

  const handleAddQuestion = () => {
    if (formPages.length === 0) {
      toast.info("Please add atleast one page to start adding questions!");
      return;
    }
    setFormPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageID === pageID) {
          const newQuestionNum = `${page?.pageQuestions?.length + 1}`;

          const newQuestion = {
            showDropdown: false,
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

  const handleAddSection = () => {
    if (formPages?.length === 0 || currentPage?.pageQuestions?.length === 0) {
      toast.info("Please add atleast one question to start adding sections!");
      return;
    }

    setFormPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageID === pageID) {
          const currentPageQuestions = currentPage?.pageQuestions;
          const rgbaColor = getRgbaColor(sectionColor, sectionOpacity / 100);
          const newSection = {
            sectionColor: rgbaColor,
            sectionOpacity: sectionOpacity,
            sectionID: nanoid(),
            questions: currentPageQuestions,
          };
          return {
            ...page,
            pageSections: [...(page.pageSections || []), newSection],
            pageQuestions: [],
          };
        }
        return page;
      })
    );
  };

  const handleAddQuestionText = () => {
    if (currentPage.pageQuestions.length === 0) return;

    setFormPages((prev) =>
      prev.map((page) => {
        if (page.pageID === pageID) {
          const updatedQuestions = page.pageQuestions.map((question, index) => {
            if (index === page.pageQuestions.length - 1) {
              // Last question
              return {
                ...question,
                questionText: "",
                isEditingQuestionText: true,
              };
            }
            return question;
          });

          return { ...page, pageQuestions: updatedQuestions };
        }
        return page;
      })
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
    console.log("inside uploadfile function");
    if (uploadType === "File Upload") {
      if (selectedFiles.length === 0) {
        toast.error("No files selected");
        return;
      }

      if (selectedFiles.length > 5) {
        toast.error("Only 5 files allowed.");
        return;
      }

      const uploadedData = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "raw");

        try {
          const res = await axios.post(
            `${API_BASE_URL}/user/upload?type=raw`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          uploadedData.push({
            name: file.name,
            url: res.data.url,
          });
        } catch (err) {
          toast.error(`Error uploading ${file.name}`);
          console.error(err);
        }
      }

      setFormPages((prevPages) =>
        prevPages.map((page) => {
          if (page.pageID !== pageID) return page;

          if (currentQuestion.insideSection) {
            const updatedSections = page.pageSections.map((section, sIndex) => {
              if (sIndex === currentQuestion.sectionIndex) {
                const updatedQuestions = section.questions.map(
                  (question, qIndex) => {
                    if (qIndex === section.questions.length - 1) {
                      // Last question
                      return {
                        ...question,
                        uploadedFiles: uploadedData,
                        userResponse: uploadedData,
                      };
                    }
                    return question;
                  }
                );
                return { ...section, questions: updatedQuestions };
              }
              return section;
            });
            return { ...page, pageSections: updatedSections };
          } else {
            const updatedQuestions = page.pageQuestions.map(
              (question, qIndex) => {
                if (qIndex === page.pageQuestions.length - 1) {
                  // Last question
                  return {
                    ...question,
                    uploadedFiles: uploadedData,
                    userResponse: uploadedData,
                  };
                }
                return question;
              }
            );
            return { ...page, pageQuestions: updatedQuestions };
          }
        })
      );

      toast.success("Files uploaded successfully!");
      setShowUploadModal(false);
      setSelectedFiles([]);
    } else {
      if (!selectedFile) {
        toast.error("No file selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", uploadType);
      console.log("uploadType =", uploadType);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      try {
        const res = await axios.post(
          `${API_BASE_URL}/user/upload?type=${uploadType}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const data = res.data;

        setFormPages((prevPages) =>
          prevPages.map((page) => {
            if (page.pageID !== pageID) return page;

            const updatedQuestions = page.pageQuestions.map(
              (question, qIndex) => {
                if (qIndex === page.pageQuestions.length - 1) {
                  // Last question
                  const updatedQuestion = { ...question };

                  if (uploadType === "image") {
                    updatedQuestion.questionImage = data.url;
                  } else if (uploadType === "video") {
                    updatedQuestion.questionVideo = data.url;
                  } else if (uploadType === "pdf") {
                    updatedQuestion.questionPDF = data.url;
                  } else if (uploadType === "zip") {
                    updatedQuestion.questionZIP = data.url;
                  } else if (uploadType === "audio") {
                    updatedQuestion.questionAudio = data.url;
                  } else if (uploadType === "ppt") {
                    updatedQuestion.questionPPT = data.url;
                  } else if (uploadType === "spreadsheet") {
                    updatedQuestion.questionSpreadsheet = data.url;
                  } else if (uploadType === "document") {
                    updatedQuestion.questionDocument = data.url;
                  }

                  return updatedQuestion;
                }
                return question;
              }
            );

            return { ...page, pageQuestions: updatedQuestions };
          })
        );

        toast.success("File uploaded successfully!");
        setShowUploadModal(false);
        setSelectedFile(null);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
        console.error(err);
      }
    }
  };

  const handleFileChange = (e) => {
    const MAX_FILE_SIZE_MB = 5;
    const files = Array.from(e.target.files);
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (uploadType === "File Upload") {
      if (selectedFiles.length + files.length > 5) {
        toast.error("Maximum 5 files allowed.");
        return;
      }

      const validFiles = [];

      for (const file of files) {
        if (file.size > maxBytes) {
          toast.error(
            `${file.name} is too large! Max ${MAX_FILE_SIZE_MB}MB allowed.`
          );
        } else {
          validFiles.push(file);
        }
      }

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    } else {
      const file = files[0];
      if (!file) return;
      if (file.size > maxBytes) {
        toast.error(`File too large! Max ${MAX_FILE_SIZE_MB}MB allowed.`);
        return;
      }
      setSelectedFile(file);
    }

    toast.success(
      "You have chosen some file(s). Click on Upload File to upload them"
    );
  };

  const handleSaveForm = async () => {
    dispatch(saveForm({ formID, projectID, formPages }));

    await axios.post(`${API_BASE_URL}/user/saveForm`, {
      formID: formID,
      currentProjectID: projectID,
      currentProjectName: project?.projectName,
      targetProjectID: projectID,
      sharedByEmail: email,
      currentForm: form,
    });

    toast.success("Form saved successfully!");
  };

  return (
    <div className="create-form-container">
      {showPreview ? (
        <div
          className="previewMode"
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            position: "relative",
          }}
        >
          <div
            className="sidebar-logo"
            style={{
              cursor: "pointer",
              position: "absolute",
              top: "30px",
              left: "24px",
              zIndex: "1",
            }}
            onClick={() => navigate("/homepage")}
          >
            <img src="/homepageIcon.png" alt="homepageIcon" />
            <span className="logo">CANOVA</span>
          </div>

          {/* Form Body */}
          <div
            className="form-body"
            style={{
              margin: "5px",
              backgroundColor:
                getRgbaColor(formBodyBgColor, formBodyOpacity / 100) ||
                currentPage.pageBgColor,
              maxWidth: "808px",
              width: "100%",
              marginTop: "20px",
              borderRadius: "10px",
              paddingTop: "10px",
            }}
          >
            {/* From Header */}
            {isPageSelected && (
              <>
                <div
                  className="form-header-preview"
                  style={{
                    paddingBottom: "15px",
                    borderBottom: "1px solid white",
                  }}
                >
                  <h2 className="form-title-preview">{currentPage.pageName}</h2>
                </div>
                <div
                  className="gapDiv"
                  style={{
                    height: "15px",
                    backgroundColor:
                      getRgbaColor(formBodyBgColor, formBodyOpacity / 100) ||
                      currentPage.pageBgColor,
                    border: "1px solid transparent",
                  }}
                ></div>
              </>
            )}

            {isPageSelected && (
              <>
                {currentPage.isConditionMode ? (
                  <ConditionModeView
                    currentPage={currentPage}
                    setFormPages={setFormPages}
                    formPages={formPages}
                  />
                ) : (
                  <>
                    {currentPage?.pageSections &&
                      currentPage?.pageSections?.map(
                        (section, sectionIndex) => (
                          <div
                            key={section.sectionID}
                            style={{
                              backgroundColor: section.sectionColor,
                              borderRadius: "12px",
                              padding: "16px",
                              marginBottom: "20px",
                            }}
                          >
                            {section?.questions?.map(
                              (question, questionIndex) => (
                                <QuestionBlock
                                  showPreview={showPreview}
                                  key={question.questionID}
                                  qIndex={questionIndex}
                                  question={question}
                                  formPages={formPages}
                                  setFormPages={setFormPages}
                                  insideSection={true}
                                  sectionIndex={sectionIndex}
                                  setUploadType={setUploadType}
                                  setShowUploadModal={setShowUploadModal}
                                  currentQuestion={currentQuestion}
                                  setCurrentQuestion={setCurrentQuestion}
                                  uploadType={uploadType}
                                  selectedFiles={selectedFiles}
                                />
                              )
                            )}
                          </div>
                        )
                      )}

                    {currentPage?.pageQuestions &&
                      currentPage?.pageQuestions?.map((question, index) => (
                        <QuestionBlock
                          showPreview={showPreview}
                          qIndex={index}
                          question={question}
                          key={question.questionID}
                          formPages={formPages}
                          setFormPages={setFormPages}
                          uploadType={uploadType}
                          setUploadType={setUploadType}
                          showUploadModal={showUploadModal}
                          setShowUploadModal={setShowUploadModal}
                          currentQuestion={currentQuestion}
                          setCurrentQuestion={setCurrentQuestion}
                          selectedFiles={selectedFiles}
                        />
                      ))}

                    <NextPageButton
                      formPages={formPages}
                      currentPage={currentPage}
                    />
                  </>
                )}
              </>
            )}

            <button
              className="backToEdit"
              onClick={() => setShowPreview(false)}
              style={{
                position: "fixed",
                right: "50px",
                top: "640px",
                backgroundColor: "#000",
                color: "#fff",
                padding: "10px 24px",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              Back to Edit
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Left Sidebar */}
          <div className="left-sidebar">
            <div
              className="sidebar-logo"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/homepage")}
            >
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
                        navigate(
                          `/createForm/${projectID}/${formID}/${page.pageID}`
                        );
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
                      <span className="pageNameContainer">
                        <span className="pageNameText">{page.pageName}</span>
                        {page?.pageCondition?.ifTruePage &&
                          page?.pageCondition?.ifFalsePage && (
                            <span className="conditionIconsContainer">
                              <img
                                src="/conditionIcon.png"
                                className="conditionTrueIcon"
                                alt="trueIcon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/createForm/${projectID}/${formID}/${page?.pageCondition?.ifTruePage}`
                                  );
                                }}
                              />
                              <img
                                src="/conditionIcon.png"
                                className="conditionFalseIcon"
                                alt="falseIcon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/createForm/${projectID}/${formID}/${page?.pageCondition?.ifFalsePage}`
                                  );
                                }}
                              />
                            </span>
                          )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button className="add-page-btn" onClick={handleAddPage}>
                <img src="/addPageIcon.png" alt="add page icon" />
                <span>Add new Page</span>
              </button>
            </div>

            <button
              style={{ borderColor: "transparent", cursor: "pointer" }}
              onClick={logout}
              className="btn-logout"
            >
              <img src="/logoutIcon.png" alt="" />
            </button>
          </div>

          {showFlowChart ? (
            <>
              {isPageSelected && (
                <div className="form-header">
                  <h2 className="form-title">{currentPage.pageName}</h2>
                  {!showFlowChart && (
                    <div className="form-header-buttons">
                      <button className="preview-btn">Preview</button>
                      <button className="save-btn">Save</button>
                    </div>
                  )}
                </div>
              )}
              <FlowChart
                formPages={formPages}
                setPublishModalOpen={setPublishModalOpen}
              />

              {publishModalOpen && (
                <PublishModal
                  publishModalOpen={publishModalOpen}
                  setPublishModalOpen={setPublishModalOpen}
                  formID={formID}
                  formName={currentFormName}
                  currentProjectID={projectID}
                  formPages={formPages}
                  setFormPages={setFormPages}
                />
              )}
            </>
          ) : (
            <>
              {/* From Header */}
              {isPageSelected && (
                <div className="form-header">
                  <h2 className="form-title">{currentPage.pageName}</h2>
                  <div className="form-header-buttons">
                    <button
                      className="preview-btn"
                      onClick={() => setShowPreview(true)}
                    >
                      Preview
                    </button>
                    <button
                      className="save-btn"
                      onClick={() => handleSaveForm()}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Form Body */}
              <div
                className="form-body"
                style={{
                  margin: "10px",
                  backgroundColor:
                    getRgbaColor(formBodyBgColor, formBodyOpacity / 100) ||
                    currentPage.pageBgColor,
                }}
              >
                {showUploadModal && (
                  <div
                    className="upload-modal-overlay"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <div
                      className="upload-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src="/modalCloseIcon.png"
                        alt="Close"
                        className="close-icon"
                        onClick={() => setShowUploadModal(false)}
                      />

                      <h3>
                        {uploadType === "File Upload"
                          ? "Upload your files"
                          : `Upload a ${uploadType}`}
                      </h3>

                      <div
                        className={`upload-dropzone ${
                          dragOver ? "drag-over" : ""
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          handleFileChange({
                            target: { files: e.dataTransfer.files },
                          });
                        }}
                      >
                        <p>
                          Drag & drop your{" "}
                          {uploadType === "File Upload" ? "files" : uploadType}{" "}
                          here or click to browse
                        </p>

                        <span className="browse-button">Browse files</span>

                        <input
                          type="file"
                          multiple={uploadType === "File Upload"}
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

                      {uploadType === "File Upload" ? (
                        <ul style={{ marginTop: "10px", color: "#333" }}>
                          {selectedFiles.map((file, i) => (
                            <li key={i}>{file.name}</li>
                          ))}
                        </ul>
                      ) : (
                        selectedFile && (
                          <p style={{ marginTop: "10px", color: "#333" }}>
                            Selected: <strong>{selectedFile.name}</strong>
                          </p>
                        )
                      )}

                      <button
                        className="uploadFileBtn"
                        onClick={uploadFile}
                        disabled={
                          uploadType === "File Upload" &&
                          selectedFiles.length === 0
                        }
                      >
                        Upload File
                      </button>
                    </div>
                  </div>
                )}

                {isPageSelected && (
                  <>
                    {currentPage.isConditionMode ? (
                      <ConditionModeView
                        currentPage={currentPage}
                        setFormPages={setFormPages}
                        formPages={formPages}
                      />
                    ) : (
                      <>
                        {currentPage?.pageSections &&
                          currentPage?.pageSections?.map(
                            (section, sectionIndex) => (
                              <div
                                key={section.sectionID}
                                style={{
                                  backgroundColor: section.sectionColor,
                                  borderRadius: "12px",
                                  padding: "16px",
                                  marginBottom: "20px",
                                }}
                              >
                                {section?.questions?.map(
                                  (question, questionIndex) => (
                                    <QuestionBlock
                                      key={question.questionID}
                                      qIndex={questionIndex}
                                      question={question}
                                      formPages={formPages}
                                      setFormPages={setFormPages}
                                      insideSection={true}
                                      sectionIndex={sectionIndex}
                                      setUploadType={setUploadType}
                                      setShowUploadModal={setShowUploadModal}
                                      currentQuestion={currentQuestion}
                                      setCurrentQuestion={setCurrentQuestion}
                                      uploadType={uploadType}
                                      selectedFiles={selectedFiles}
                                    />
                                  )
                                )}
                              </div>
                            )
                          )}

                        {currentPage?.pageQuestions &&
                          currentPage?.pageQuestions?.map((question, index) => (
                            <QuestionBlock
                              qIndex={index}
                              question={question}
                              key={question.questionID}
                              formPages={formPages}
                              setFormPages={setFormPages}
                              uploadType={uploadType}
                              setUploadType={setUploadType}
                              showUploadModal={showUploadModal}
                              setShowUploadModal={setShowUploadModal}
                              currentQuestion={currentQuestion}
                              setCurrentQuestion={setCurrentQuestion}
                              selectedFiles={selectedFiles}
                            />
                          ))}

                        {!currentPage.isConditionMode &&
                          (currentPage.pageQuestions.length !== 0 ||
                            currentPage?.pageSections?.length !== 0) &&
                          formPages.length > 1 &&
                          formPages.findIndex(
                            (p) => p.pageID === currentPage.pageID
                          ) !==
                            formPages.length - 1 && (
                            <NextPageButton
                              currentPage={currentPage}
                              formPages={formPages}
                            />
                          )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Right Sidebar */}
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
                      toast.info(
                        "Add at least one question to start adding Text"
                      );
                      return;
                    }
                    handleAddQuestionText();
                  }}
                  className="tool-button"
                >
                  <img src="/addTextIcon.png" alt="Add Text" />
                  Add Text
                </button>
                <button
                  className="tool-button"
                  onClick={handleToggleConditionMode}
                >
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
                      toast.info(
                        "Add at least one question to start adding image"
                      );
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
                      toast.info(
                        "Add at least one question to start adding video"
                      );
                      return;
                    }
                    setUploadType("video");
                    setShowUploadModal(true);
                  }}
                >
                  <img src="/addVideoIcon.png" alt="Add Video" />
                  Add Video
                </button>
                <button
                  className="tool-button"
                  onClick={() => handleAddSection()}
                >
                  <img src="/addSectionIcon.png" alt="Add Sections" />
                  Add Sections
                </button>

                <div className="color-picker-group">
                  <label>Section Color</label>

                  <div className="color-input-row">
                    <div
                      className="color-box"
                      style={{
                        background:
                          getRgbaColor(sectionColor, sectionOpacity / 100) ||
                          currentPage?.pageSections?.[pageSections.length - 1]
                            ?.sectionColor,
                      }}
                    ></div>

                    {isEditingSectionColor ? (
                      <input
                        type="text"
                        autoFocus
                        className="section-color-input"
                        value={sectionColor}
                        style={{ width: "80px" }}
                        onChange={(e) => setSectionColor(e.target.value)}
                        onBlur={() => setIsEditingSectionColor(false)}
                      />
                    ) : (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsEditingSectionColor(true)}
                      >
                        {sectionColor ||
                          currentPage?.pageSections?.[pageSections.length - 1]
                            ?.sectionColor}
                      </span>
                    )}

                    {isEditingSectionOpacity ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        autoFocus
                        className="section-opacity-input"
                        value={sectionOpacity}
                        style={{ width: "45px", marginLeft: 8 }}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value > 100) value = 100;
                          if (value < 0) value = 0;
                          setSectionOpacity(value);
                        }}
                        onBlur={() => setIsEditingSectionOpacity(false)}
                      />
                    ) : (
                      <span
                        style={{ marginLeft: 8, cursor: "pointer" }}
                        onClick={() => setIsEditingSectionOpacity(true)}
                      >
                        {sectionOpacity ||
                          currentPage?.pageSections?.[pageSections.length - 1]
                            ?.sectionOpacity}
                        %
                      </span>
                    )}
                  </div>

                  <label>Background Color</label>
                  <div
                    className="color-input-row"
                    style={{ marginTop: "1rem" }}
                  >
                    <div
                      className="color-box"
                      style={{
                        background:
                          getRgbaColor(
                            formBodyBgColor,
                            formBodyOpacity / 100
                          ) || currentPage.formBodyBgColor,
                        border: "1px solid #ccc",
                      }}
                    ></div>

                    {isEditingFormBodyColor ? (
                      <input
                        type="text"
                        autoFocus
                        className="form-body-color-input"
                        value={formBodyBgColor}
                        style={{ width: "80px" }}
                        onChange={(e) => setFormBodyBgColor(e.target.value)}
                        onBlur={(e) => {
                          setIsEditingFormBodyColor(false);
                          setFormPages((prevPages) =>
                            prevPages.map((page) =>
                              page.pageID === pageID
                                ? {
                                    ...page,
                                    pageBgColor: e.target.value,
                                  }
                                : page
                            )
                          );
                        }}
                      />
                    ) : (
                      <span
                        style={{ cursor: "pointer", marginLeft: 8 }}
                        onClick={() => setIsEditingFormBodyColor(true)}
                        title="Click to edit form background color"
                      >
                        {formBodyBgColor || currentPage.formBodyBgColor}
                      </span>
                    )}

                    {isEditingFormBodyOpacity ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        autoFocus
                        className="form-body-opacity-input"
                        value={formBodyOpacity}
                        style={{ width: "45px", marginLeft: 8 }}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value > 100) value = 100;
                          if (value < 0) value = 0;
                          setFormBodyOpacity(value);
                        }}
                        onBlur={(e) => {
                          setIsEditingFormBodyOpacity(false);
                          setFormPages((prevPages) =>
                            prevPages.map((page) =>
                              page.pageID === pageID
                                ? {
                                    ...page,
                                    pageBgOpacity: e.target.value,
                                  }
                                : page
                            )
                          );
                        }}
                      />
                    ) : (
                      <span
                        style={{ marginLeft: 8, cursor: "pointer" }}
                        onClick={() => setIsEditingFormBodyOpacity(true)}
                        title="Click to edit form background opacity"
                      >
                        {formBodyOpacity || currentPage.formBodyOpacity}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="next-btn"
                  onClick={() => {
                    setShowFlowChart(true);
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CreateFormLayout;
