import { useParams } from "react-router-dom";
import "./QuestionBlock.css";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";

const QuestionBlock = ({ formPages, setFormPages }) => {
  const { pageID } = useParams();
  const currentPage = formPages.find((p) => p.pageID === pageID);
  if (!currentPage) return null;

  const updateCurrentPage = (newQuestions) => {
    setFormPages((prev) =>
      prev.map((page) =>
        page.pageID === pageID ? { ...page, pageQuestions: newQuestions } : page
      )
    );
    console.log(formPages);
  };

  const handleQuestionNameChange = (index, text) => {
    const updated = [...currentPage.pageQuestions];
    updated[index].questionName = text;
    updateCurrentPage(updated);
  };

  const toggleQuestionEditMode = (qIndex, editing) => {
    const updated = [...currentPage.pageQuestions];
    if (updated[qIndex].questionName === "") {
      updated[qIndex].questionName = "What is ?";
    }
    updated[qIndex].isEditing = editing;
    updateCurrentPage(updated);
  };

  const handleTypeChange = (index, type) => {
    const updated = [...currentPage.pageQuestions];
    updated[index].questionType = type;

    if (type === "Multiple Choice" || type === "Checkbox") {
      updated[index].options = [
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Option 1",
          isEditing: false,
        },
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Option 2",
          isEditing: false,
        },
      ];
    } else if (type === "Dropdown") {
      updated[index].options = [
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Please select...",
          isEditing: false,
        },
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Dropdown Option 1",
          isEditing: false,
        },
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Dropdown Option 2",
          isEditing: false,
        },
      ];
    } else if (type === "Rating") {
      updated[index].rating = 0;
    } else if (type === "Linear Scale") {
      updated[index].scale = 5;
    } else if (type === "Date") {
      updated[index].date = "";
    } else if (type === "File Upload") {
      updated[index].file = null;
    }

    if (type === "Checkbox") {
      updated[index].userResponse = [];
    } else if (type === "File Upload") {
      updated[index].userResponse = "";
      updated[index].file = null;
    } else {
      updated[index].userResponse = "";
    }

    updateCurrentPage(updated);
  };

  const handleOptionTextChange = (qIndex, oIndex, value) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].options[oIndex].optionName = value;
    updateCurrentPage(updated);
  };

  const toggleOptionEditMode = (qIndex, oIndex, editing) => {
    const updated = [...currentPage.pageQuestions];
    if (updated[qIndex].options[oIndex].optionName === "") {
      updated[qIndex].options[
        oIndex
      ].optionName = `Option ${updated[qIndex].options.length}`;
    }
    updated[qIndex].options[oIndex].isEditing = editing;
    updateCurrentPage(updated);
  };

  const handleOptionKeyDown = (qIndex, oIndex, e) => {
    const updated = [...currentPage.pageQuestions];
    const type = updated[qIndex].questionType;

    if (e.key === "Enter") {
      e.preventDefault();
      e.preventDefault();
      updated[qIndex].options.splice(oIndex + 1, 0, {
        optionID: nanoid(),
        optionType: type,
        optionName:
          type === "Dropdown"
            ? `Dropdown Option ${updated[qIndex].options.length + 1}`
            : `Option ${updated[qIndex].options.length + 1}`,
        isEditing: true,
      });
      updateCurrentPage(updated);
    }

    if (
      e.key === "Backspace" &&
      updated[qIndex].options[oIndex].optionName.trim() === ""
    ) {
      if (updated[qIndex].options.length === 1) {
        toast.info("Atleast one option must be present.");
        updated[qIndex].options[oIndex].optionName = "Option 11";
        updateCurrentPage(updated);
        return;
      }
      updated[qIndex].options.splice(oIndex, 1);
      updateCurrentPage(updated);
    }
  };

  const handleQuestionDelete = (qIndex) => {
    const updated = [...currentPage.pageQuestions];
    updated.splice(qIndex, 1);
    updateCurrentPage(updated);
  };

  const handleRatingChange = (qIndex, value) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].rating = value;
    updated[qIndex].userResponse = value;
    updateCurrentPage(updated);
  };

  const handleScaleChange = (qIndex, value) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].scale = parseInt(value);
    updated[qIndex].userResponse = parseInt(value);
    updateCurrentPage(updated);
  };

  const handleDateChange = (qIndex, value) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].date = value;
    updated[qIndex].userResponse = value;
    updateCurrentPage(updated);
  };

  const handleFileChange = (qIndex, file) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].file = file;
    updated[qIndex].userResponse = file;
    updateCurrentPage(updated);
  };

  const handleResponseChange = (qIndex, value) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].userResponse = value;
    updateCurrentPage(updated);
  };

  const handleTextResponseChange = (qIndex, value) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].userResponse = value;
    updateCurrentPage(updated);
  };

  const handleSelectionResponse = (qIndex, value) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex].userResponse = value;
    updateCurrentPage(updated);
  };

  const handleQuestionTextChange = (qIndex, newText) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex] = {
      ...updated[qIndex],
      questionText: newText,
    };
    updateCurrentPage(updated);
    console.log(updated);
  };

  const handleQuestionTextKeyDown = (qIndex, e) => {
    if (e.key === "Backspace" && e.target.value === "") {
      const updated = [...currentPage.pageQuestions];
      delete updated[qIndex].questionText;
      delete updated[qIndex].isEditingQuestionText;

      updateCurrentPage([...updated]);
      console.log(updated);
    }
  };

  const toggleQuestionTextEditMode = (qIndex, isEditing) => {
    const updated = [...currentPage.pageQuestions];
    updated[qIndex] = {
      ...updated[qIndex],
      isEditingQuestionText: isEditing,
    };
    updateCurrentPage(updated);
  };

  return (
    <>
      {currentPage.pageQuestions.map((question, qIndex) => (
        <div className="question-block" key={qIndex}>
          
          {question.questionImage && (
            <img
              src={question.questionImage}
              alt="Question image"
              className="question-img-preview"
            />
          )}

          {question.questionVideo && (
            <video
              src={question.questionVideo}
              controls
              className="question-video-preview"
            />
          )}

          {(question.questionText !== undefined ||
            question.isEditingQuestionText) && (
            <div className="question-text-container">
              {question.isEditingQuestionText ? (
                <textarea
                  value={question.questionText}
                  autoFocus
                  onChange={(e) =>
                    handleQuestionTextChange(qIndex, e.target.value)
                  }
                  onKeyDown={(e) => handleQuestionTextKeyDown(qIndex, e)}
                  onBlur={() => toggleQuestionTextEditMode(qIndex, false)}
                  className="question-textarea"
                  placeholder="Enter description here...Press Backspace to delete this input box"
                />
              ) : (
                <span
                  className="question-text-display"
                  onClick={() => toggleQuestionTextEditMode(qIndex, true)}
                >
                  {question.questionText ||
                    "Click here to add question description..."}
                </span>
              )}
            </div>
          )}

          <div className="question-header">
            <span className="question-number">Q{qIndex + 1}</span>
            {question.isEditing ? (
              <input
                autoFocus
                value={question.questionName}
                onChange={(e) =>
                  handleQuestionNameChange(qIndex, e.target.value)
                }
                onBlur={() => toggleQuestionEditMode(qIndex, false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    toggleQuestionEditMode(qIndex, false);
                  }
                  if (
                    e.key === "Backspace" &&
                    question?.questionName?.trim() === ""
                  ) {
                    handleQuestionDelete(qIndex);
                  }
                }}
                placeholder="Enter your question"
                className="question-input"
              />
            ) : (
              <span
                className="question-text-display"
                onClick={() => toggleQuestionEditMode(qIndex, true)}
              >
                {question.questionName}
              </span>
            )}

            <select
              value={question.questionType}
              onChange={(e) => handleTypeChange(qIndex, e.target.value)}
              className="type-dropdown"
            >
              <option>Multiple Choice</option>
              <option>Checkbox</option>
              <option>Dropdown</option>
              <option>Short Answer</option>
              <option>Long Answer</option>
              <option>Date</option>
              <option>File Upload</option>
              <option>Linear Scale</option>
              <option>Rating</option>
            </select>
          </div>

          <div className="question-options">
            {question.questionType === "Short Answer" && (
              <textarea
                value={question.userResponse || ""}
                onChange={(e) =>
                  handleTextResponseChange(qIndex, e.target.value)
                }
              />
            )}

            {question.questionType === "Long Answer" && (
              <textarea
                value={question.userResponse || ""}
                onChange={(e) =>
                  handleTextResponseChange(qIndex, e.target.value)
                }
              />
            )}

            {question.questionType === "Multiple Choice" &&
              question.options.map((opt, oIndex) => (
                <div key={oIndex} className="option-row">
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={question.userResponse === opt.optionID}
                    onChange={() =>
                      handleSelectionResponse(qIndex, opt.optionID)
                    }
                  />
                  {opt.isEditing ? (
                    <input
                      autoFocus
                      value={opt.optionName}
                      onChange={(e) =>
                        handleOptionTextChange(qIndex, oIndex, e.target.value)
                      }
                      onBlur={() => toggleOptionEditMode(qIndex, oIndex, false)}
                      onKeyDown={(e) => handleOptionKeyDown(qIndex, oIndex, e)}
                      className="option-input"
                    />
                  ) : (
                    <span
                      className="option-text-display"
                      onClick={() => toggleOptionEditMode(qIndex, oIndex, true)}
                    >
                      {opt.optionName}
                    </span>
                  )}
                </div>
              ))}

            {question.questionType === "Checkbox" &&
              question.options.map((opt, oIndex) => (
                <div key={oIndex} className="option-row">
                  <input
                    type="checkbox"
                    name={`question-${qIndex}`}
                    value={opt.optionID}
                    checked={
                      Array.isArray(question.userResponse) &&
                      question.userResponse.includes(opt.optionID)
                    }
                    onChange={(e) => {
                      const updated = [...currentPage.pageQuestions];
                      const isChecked = e.target.checked;
                      if (!Array.isArray(updated[qIndex].userResponse)) {
                        updated[qIndex].userResponse = [];
                      }

                      if (isChecked) {
                        updated[qIndex].userResponse.push(opt.optionID);
                      } else {
                        updated[qIndex].userResponse = updated[
                          qIndex
                        ].userResponse.filter((id) => id !== opt.optionID);
                      }

                      updateCurrentPage(updated);
                    }}
                  />

                  {opt.isEditing ? (
                    <input
                      autoFocus
                      value={opt.optionName}
                      onChange={(e) =>
                        handleOptionTextChange(qIndex, oIndex, e.target.value)
                      }
                      onBlur={() => toggleOptionEditMode(qIndex, oIndex, false)}
                      onKeyDown={(e) => handleOptionKeyDown(qIndex, oIndex, e)}
                      className="option-input"
                    />
                  ) : (
                    <span
                      className="option-text-display"
                      onClick={() => toggleOptionEditMode(qIndex, oIndex, true)}
                    >
                      {opt.optionName}
                    </span>
                  )}
                </div>
              ))}

            {question.questionType === "Dropdown" && (
              <div className="dropdown-wrapper">
                <select
                  className="dropdown-select"
                  value={
                    question.userResponse ||
                    (question.options.length > 0
                      ? question.options[0].optionID
                      : "")
                  }
                  onChange={(e) => handleResponseChange(qIndex, e.target.value)}
                >
                  {question.options.map((opt) => (
                    <option key={opt.optionID} value={opt.optionID}>
                      {opt.optionName}
                    </option>
                  ))}
                </select>

                <div className="dropdown-options-list">
                  {question.options.map((opt, oIndex) => (
                    <div key={opt.optionID}>
                      {opt.isEditing ? (
                        <input
                          autoFocus
                          value={opt.optionName}
                          onChange={(e) =>
                            handleOptionTextChange(
                              qIndex,
                              oIndex,
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            toggleOptionEditMode(qIndex, oIndex, false)
                          }
                          onKeyDown={(e) =>
                            handleOptionKeyDown(qIndex, oIndex, e)
                          }
                          className="option-input"
                        />
                      ) : (
                        <span
                          className="option-text-display"
                          onClick={() =>
                            toggleOptionEditMode(qIndex, oIndex, true)
                          }
                        >
                          {opt.optionName}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.questionType === "Rating" && (
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => {
                      handleRatingChange(qIndex, star); // Already sets rating visually
                      handleResponseChange(qIndex, star); // Also stores in userResponse
                    }}
                    style={{
                      cursor: "pointer",
                      color:
                        question.rating && question.rating >= star
                          ? "gold"
                          : "lightgray",
                      fontSize: "1.5rem",
                    }}
                  >
                    ★
                  </span>
                ))}
                <div>Selected: {question.rating || 0} Star(s)</div>
              </div>
            )}

            {question.questionType === "Linear Scale" && (
              <div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={question.scale}
                  onChange={(e) => {
                    handleScaleChange(qIndex, e.target.value); // updates UI slider
                    handleResponseChange(qIndex, e.target.value); // saves value to userResponse
                  }}
                />
                <span style={{ marginLeft: "10px" }}>{question.scale}</span>
              </div>
            )}

            {question.questionType === "Date" && (
              <input
                type="date"
                value={question.date || ""}
                onChange={(e) => {
                  handleDateChange(qIndex, e.target.value); // for displaying
                  handleResponseChange(qIndex, e.target.value); // for storing
                }}
              />
            )}

            {question.questionType === "File Upload" && (
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleFileChange(qIndex, file); // stores file object
                    handleResponseChange(qIndex, file.name); // stores filename.ext in userResponse
                  }
                }}
              />
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default QuestionBlock;
